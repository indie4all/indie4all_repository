const { Router } = require('express');
const { getSignInPage,
    getSignUpPage,
    signInUser,
    signUpNewUser } = require('../controllers/sign');
const { check } = require('express-validator');
const { validateFields } = require('../middlewares/validateFields');

const router = Router();

router.get('/sign/in', getSignInPage);

router.get('/sign/up', getSignUpPage);

router.post('/sign/in', [
    check('email', 'Email is mandatory').isEmail(),
    check('password', 'Password is mandatory').not().isEmpty(),
    validateFields
], signInUser);

router.post('/sign/up',[
    check('password', 'Password is mandatory').not().isEmpty(),
    check('email', 'Email is mandatory').isEmail(),
    check('password', 'Password is mandatory').not().isEmpty(),
    
], signUpNewUser)

module.exports = router;