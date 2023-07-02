const { Router } = require('express');
const { getSignInPage,
    getSignUpPage,
    signInUser,
    signUpNewUser,
    getProfile,
    getEditUserForm,
    editUser,
    getUser,
    googleSignIn } = require('../controllers/sign');
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
    check('email', 'Email is mandatory').isEmail(),
    check('password', 'Password is mandatory').not().isEmpty(),
    validateFields
], signUpNewUser)

//Google Sign In
router.post('/sign/google', [
    check('id_token', 'id_token is mandatory').not().isEmpty(),
    validateFields
], googleSignIn);


//Profile end-point
router.get('/profile', [
    validateJwt
], getProfile)


//Edit user end-points
router.get('/edit/:id', [
    validateJwt,
    check('id', 'Not valid ID').isMongoId(),
    validateFields
], getEditUserForm)

router.post('/edit/:id', [
    validateJwt,
    check('id', 'Not valid ID').isMongoId(),
    validateFields
], editUser)


//Retrieve certain user data
router.get('/:id', [
    validateJwt,
    check('id', 'Not valid ID').isMongoId(),
    validateFields
], getUser)


module.exports = router;