const jwt = require('jsonwebtoken')
const User = require('../models/user')

const protect = async (req, res, next) => {
  let token
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1]
      const decoded = jwt.verify(token, process.env.JWT_SECRET)
      req.user = await User.findById(decoded.id).select('-password')
      if (!req.user) {
        return res
          .status(401)
          .json({ message: 'Not authorized,User not found' })
      }
      next()
    } catch (err) {
      return res.status(401).json({ message: 'Not authorized,token failed' })
    }
  }
  if (!token) {
    return res.status(401).json({ message: 'Not authorized,no token' })
  }
}
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
