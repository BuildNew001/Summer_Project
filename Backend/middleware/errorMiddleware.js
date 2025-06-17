const globalErrorHandler = (err, req, res, next) => {
  console.error(err.stack)
  res.status(err.status || 500).json({
    message: err.message || 'An unexpected error occurred',
    ...(process.env.NODE_ENV === 'development' && { error: err.stack }),
  })
}
module.exports = { globalErrorHandler }