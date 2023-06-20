const { Router } = require('express');
const { getSignInPage,
    getSignUpPage,
    signInUser,
    signUpNewUser } = require('../controllers/sign');
const { check } = require('express-validator');
const { validateFields } = require('../middlewares/validateFields');

const router = Router();

router.get('/in', getSignInPage);

router.get('/up', getSignUpPage);

router.post('/in', [
    check('email', 'Email is mandatory').isEmail(),
    check('password', 'Password is mandatory').not().isEmpty(),
    validateFields
], signInUser);

router.post('/up', signUpNewUser)

module.exports = router;