const express = require('express');
const router = express.Router();
const {body} = require('express-validator');
const userController = require('../controllers/user.controller');

const normalizename = (req , res , next) =>{
    if(req.body.name && !req.body.name){
        if(req.body.name.length ){
            req.body.name = {
                firstname : req.body.name.firstname,
                lastname : req.body.name.lastname || ''
            };
        }
    }
    next();
}

router.post('/register' , normalizename , [
    body('email').isEmail().withMessage('Invalid email address'),
    body('password').isLength({min : 6}).withMessage('Password must be at least 6 characters long'),
    body('name').notEmpty().withMessage('Name is required')
] , userController.register);

router.post('/verify-otp' , [
    body('email').isEmail().withMessage('Invalid email address'),
    body('otp').isLength({min : 6 , max : 6}).withMessage('OTP must be 6 digits long')
] , userController.verifyOTP);

module.exports = router;


router.post('/login' , [
    body('email').isEmail().withMessage('Invalid email address'),
    body('password').notEmpty().withMessage('Password is required')
] , userController.login);