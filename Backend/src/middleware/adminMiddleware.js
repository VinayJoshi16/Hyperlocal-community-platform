const adminMiddleware = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ success: false, message: 'Unauthorized: No user found' });
  }

  // Strictly enforce that only the master admin email can access these routes
  if (req.user.email !== 'vinay.joshi1608@gmail.com') {
    return res.status(403).json({ success: false, message: 'Forbidden: Admin access only' });
  }

  next();
};

module.exports = { adminMiddleware };
