const express = require('express');
const { register, login, getMe, forgotPassword, resetPassword } = require('../controllers/auth');
const { registerValidation, loginValidation, forgotPasswordValidation, resetPasswordValidation } = require('../validators/auth');
const validate = require('../middleware/validate');

const router = express.Router();

const { protect } = require('../middleware/auth');

router.post('/register', registerValidation, validate, register);
router.post('/login', loginValidation, validate, login);
console.log("Login mounted");
router.get('/me', protect, getMe);
router.post('/forgot-password', forgotPasswordValidation, validate, forgotPassword);
router.put('/reset-password/:resettoken', resetPasswordValidation, validate, resetPassword);

module.exports = router;
