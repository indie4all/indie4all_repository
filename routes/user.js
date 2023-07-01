const { Router } = require('express');
const { getSignInPage,
    getSignUpPage,
    signInUser,
    signUpNewUser,
    getProfile } = require('../controllers/sign');
const { check } = require('express-validator');
const { validateFields } = require('../middlewares/validateFields');
const validateJwt = require('../middlewares/validateJwt');

const router = Router();

//Sign in/up end-points
router.get('/sign/in', getSignInPage);

router.get('/sign/up', getSignUpPage);

router.post('/sign/in', [
    check('email', 'Email is mandatory').isEmail(),
    check('password', 'Password is mandatory').not().isEmpty(),
    validateFields
], signInUser);

router.post('/sign/up', [
    check('password', 'Password is mandatory').not().isEmpty(),
    check('email', 'Email is mandatory').isEmail(),
    check('password', 'Password is mandatory').not().isEmpty(),

], signUpNewUser)


//Profile end-point
router.get('/profile', [
    validateJwt
], getProfile)

module.exports = router;