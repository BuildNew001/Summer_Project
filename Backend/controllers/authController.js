const User = require('../models/user');
const jwt = require('jsonwebtoken');

const generateToken = (user) => {
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
  );
};

exports.signup = async (req, res) => {
  const { fullname, email, password, UserName, role } = req.body;

  try {
    if (!fullname || !email || !password || !UserName) {
      return res.status(400).json({ message: 'Please fill all the fields' });
    }

    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({ message: 'Email is already registered' });
    }

    const existingUser = await User.findOne({ UserName });
    if (existingUser) {
      return res.status(400).json({ message: 'Username is already registered' });
    }

    const newUser = new User({
      fullname,
      email,
      password,
      UserName,
      role
    });

    await newUser.save();

    const token = generateToken(newUser);

    res.status(201).json({
      token,
      user: {
        id: newUser._id,
        Username: newUser.UserName,
        role: newUser.role
      }
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
