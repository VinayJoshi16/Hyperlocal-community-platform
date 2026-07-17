const { query } = require('../config/db');
const { fail } = require('../utils/helpers');

/**
 * Checks circle membership and retrieves the user's role inside the circle
 */
async function checkCircleMember(req, res, next) {
  const circleId = req.params.id || req.params.circleId;
  if (!circleId) {
    return fail(res, 'Circle ID parameter is required.', 400);
  }

  try {
    const memberCheck = await query(
      'SELECT role FROM circle_members WHERE circle_id = $1 AND user_id = $2',
      [circleId, req.user.id]
    );

    if (memberCheck.rows.length === 0) {
      return fail(res, 'You are not a member of this community group.', 403);
    }

    req.circleMemberRole = memberCheck.rows[0].role; // 'owner', 'admin', 'member'
    next();
  } catch (err) {
    console.error('Error checking circle membership:', err.message);
    return fail(res, 'Internal server check failed.', 500);
  }
}

/**
 * Requires the user to be the owner of the circle
 */
async function requireOwner(req, res, next) {
  await checkCircleMember(req, res, () => {
    if (req.circleMemberRole !== 'owner') {
      return fail(res, 'Only the group owner is authorized to perform this action.', 403);
    }
    next();
  });
}

/**
 * Requires the user to be an admin or the owner of the circle
 */
async function requireAdminOrOwner(req, res, next) {
  await checkCircleMember(req, res, () => {
    if (req.circleMemberRole !== 'owner' && req.circleMemberRole !== 'admin') {
      return fail(res, 'Only group administrators or owners are authorized to perform this action.', 403);
    }
    next();
  });
}

module.exports = {
  checkCircleMember,
  requireOwner,
  requireAdminOrOwner
};
