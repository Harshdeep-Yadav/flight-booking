// Request logger middleware
module.exports = (req, res, next) => {
  console.log(`${req.method} ${req.originalUrl}`);
  next();
}; 