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

    const token = generateToken(newUser)

    res.status(201).json({
      token,
      user: {
        id: newUser._id, 
        Username: newUser.UserName,
        role: newUser.role
      }
    })
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
    const token = generateToken(userCredential)
    res.status(200).json({
      token,
      user: {
        id: userCredential._id,
        Username: userCredential.UserName,
        role: userCredential.role
      }
    })
  } catch (err) {
    next(err) 
  }
}
