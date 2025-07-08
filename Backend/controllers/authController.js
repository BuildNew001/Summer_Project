const User = require('../models/user')
const jwt = require('jsonwebtoken')

const generateToken = user => {
  return jwt.sign(
    {
      id: user._id,
      email: user.email,
      role: user.role
    },
    process.env.JWT_SECRET,
    {
      expiresIn: '1d'
    }
  )
}

const sendTokenResponse = (user, statusCode, res) => {
  const token = generateToken(user);

  const options = {
    expires: new Date(Date.now() + 24 * 60 * 60 * 1000), 
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  };

  res.status(statusCode).cookie('token', token, options).json({
    _id: user._id,
    fullname: user.fullname,
    UserName: user.UserName,
    email: user.email,
    role: user.role,
  });
};

exports.signup = async (req, res, next) => { 
  const { fullname, email, password, UserName, dob, role } = req.body

  try {
    const existingEmail = await User.findOne({ email })
    if (existingEmail) {
      return res.status(400).json({ message: 'Email is already registered' })
    }

    const existingUser = await User.findOne({ UserName })
    if (existingUser) {
      return res.status(400).json({ message: 'Username is already registered' })
    }

    const newUser = new User({
      fullname,
      email,
      password,
      UserName,
      dob,
      role: role ? role.trim() : 'user', 
    })

    await newUser.save()

    sendTokenResponse(newUser, 201, res);
  } catch (err) {
    next(err) 
  }
}

exports.login = async (req, res, next) => { 
  const { emailOrUsername, password } = req.body
  try {
    const userCredential = await User.findOne({
      $or: [
        { email: emailOrUsername.toLowerCase() },
        { UserName: emailOrUsername }
      ]
    })
    if (!userCredential) {
      return res.status(401).json({ message: 'Invalid credentials' })
    }
    const isMatchPassword = await userCredential.comparePassword(password)
    if (!isMatchPassword) {
      return res.status(401).json({ message: 'Invalid credentials' })
    }
    sendTokenResponse(userCredential, 200, res);
  } catch (err) {
    next(err) 
  }
}

exports.logout = (req, res, next) => {
  res.cookie('token', 'none', {
    expires: new Date(Date.now() - 10 * 1000), 
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  });

  res.status(200).json({
    success: true,
    message: 'User logged out successfully',
  });
};
exports.getMe = (req, res, next) => {
  res.status(200).json(req.user);
};
