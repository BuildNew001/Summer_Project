const jwt = require('jsonwebtoken')
const User = require('../models/user')
const asyncHandler = require('express-async-handler')

const protect = asyncHandler(async (req, res, next) => {
  let token = req.cookies.token;

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select('-password');
      if (!req.user) {
        res.status(401);
        throw new Error('Not authorized, user not found');
      }
      next();
    } catch (error) {
      res.status(401);
      throw new Error('Not authorized, token failed or expired');
    }
  } else {
    res.status(401);
    throw new Error('Not authorized, no token provided');
  }
})

const authorize = (roles) => { 
  return (req, res, next) => {
    const userRole = req.user ? req.user.role : null;
    const trimmedUserRole = userRole ? userRole.trim() : null;
    if (!req.user || !trimmedUserRole || !roles.includes(trimmedUserRole)) {
      return res.status(403).json({ message: `Forbidden: User role '${userRole || 'unknown'}' is not authorized for this resource.` });
    }
    next();
  };
};

module.exports = { protect, authorize };
