// Role-based access control. Use after authMiddleware, which sets req.user.
// Usage: router.post('/alerts/emergency', authMiddleware, requireRole('admin', 'moderator'), controller)

const { fail } = require('../utils/helpers');

function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return fail(res, 'Authentication required.', 401);
    }

    if (!allowedRoles.includes(req.user.role)) {
      return fail(
        res,
        `This action requires one of these roles: ${allowedRoles.join(', ')}.`,
        403
      );
    }

    next();
  };
}

// Convenience shorthands matching the RBAC matrix we designed:
// user        - default role, can view feed, create posts, lost & found
// admin       - society admin: pinned notices, emergency alerts, moderation
// business    - verified business owner: geo-targeted promo posts
// moderator   - platform moderator: ban users, verify businesses, moderate any post
const requireAdmin = requireRole('admin');
const requireAdminOrModerator = requireRole('admin', 'moderator');
const requireBusiness = requireRole('business');
const requireModerator = requireRole('moderator');

module.exports = {
  requireRole,
  requireAdmin,
  requireAdminOrModerator,
  requireBusiness,
  requireModerator,
};