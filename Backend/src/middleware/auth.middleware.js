const jwt = require('jsonwebtoken');

const { verifyAuthToken } = require('../utils/auth');

const secretKey = process.env.JWT_SECRET;

module.exports = async (req, res, next) => {
    try {

        const authHeader = req.headers.authorization;

        if (!authHeader) {
            return res.status(401).json({
                message: 'No token provided'
            });
        }

        const token = authHeader.startsWith('Bearer ')
            ? authHeader.split(' ')[1]
            : authHeader;

        const decoded = verifyAuthToken(token);

        if (!decoded) {
            return res.status(401).json({
                message: 'Invalid or expired token'
            });
        }

        req.user = decoded;

        next();

    } catch (err) {

        return res.status(401).json({
            message: 'Invalid or expired token'
        });

    }
};