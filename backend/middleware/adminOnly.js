const adminOnly = (req, res, next) => {
  // This middleware should be used after authenticateUser middleware
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Access denied. Admin access required.' });
  }
  
  next();
};

module.exports = adminOnly; 