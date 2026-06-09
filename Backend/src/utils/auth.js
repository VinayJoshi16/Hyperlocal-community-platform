const userModel = require("../config/db");

const jwt = require('jsonwebtoken');

const bcrypt = require('bcrypt');

const secretKey = process.env.JWT_SECRET;

const user = userModel.users;

const generateAuthToken = (user) => {
    return jwt.sign(
        {
            id: user.id,
            email: user.email
        },
        secretKey,
        {
            expiresIn: '7d'
        }
    );
};

const verifyAuthToken = (token) => {
    try {
        return jwt.verify(token, secretKey);
    } catch (err) {
        return null;
    }
};

const hashPassword = async (password) => {
    return await bcrypt.hash(password, 10);
};

const comparePassword = async (
    password,
    passwordHash
) => {
    return await bcrypt.compare(
        password,
        passwordHash
    );
};

module.exports = {
    generateAuthToken,
    verifyAuthToken,
    hashPassword,
    comparePassword
};