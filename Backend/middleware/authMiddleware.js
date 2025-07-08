const jwt = require('jsonwebtoken');
const User = require('../models/user');
const asyncHandler = require('express-async-handler');

const protect = asyncHandler(async (req, res, next) => {
  const token = req.cookies.token;

  if (!token) {
    const error = new Error('Not authorized, no token provided');
    error.status = 401;
    return next(error);
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select('-password');

    if (!req.user) {
      const error = new Error('Not authorized, user not found');
      error.status = 401;
      return next(error);
    }
    console.log('Authenticated User:', req.user.UserName); 
    next();
  } catch (err) {
    const error = new Error('Not authorized, token is invalid or expired.');
    error.status = 401;
    return next(error);
  }
});

const authorize = (roles) => {
  return (req, res, next) => {
    const role = req.user?.role?.trim();
    if (!role || !roles.includes(role)) {
      const error = new Error('Forbidden: You do not have permission to perform this action.');
      error.status = 403;
      return next(error);
    }
    next();
  };
};

module.exports = { protect, authorize };
