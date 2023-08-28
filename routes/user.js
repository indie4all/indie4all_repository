const { Router } = require('express');
const { getSignInPage,
    getSignUpPage,
    signInUser,
    signUpNewUser,
    getProfile,
    getEditUserForm,
    editUser,
    getUser,
    googleSignIn,
    getAllUsers,
    deleteUser,
    getAddUserForm,
    addNewUser,
    getCurrentUser,
    getAllUsersPage,
    checkIfLogged } = require('../controllers/sign');
const { check } = require('express-validator');
const { validateFields } = require('../middlewares/validateFields');
const validateJwt = require('../middlewares/validateJwt');
const {findUserById, isAdminRole, emailExists } = require('../helpers/dbValidators');
const upload = require("../middlewares/configureMulter");

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
    check('name', 'Name is mandatory').not().isEmpty(),
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
    validateFields,
    upload.single('image')
], editUser)

//Get all users end-point
router.get('/get/all', [
    validateJwt,
    check('page', 'Page parameter should be an integer').isInt(),
    validateFields
], getAllUsers);

//Delete user end-points
router.delete('/delete/:id', [
    validateJwt,
    check('id', 'Misssing User Id').not().isEmpty(),
    check('id', 'Not valid ID').isMongoId(),
    check('id').custom( findUserById ),
    validateFields
], deleteUser);

//Get add user form
router.get('/add/form', [
    validateJwt,
    check('id').custom( isAdminRole )
], getAddUserForm);

//Get add user form
router.post('/add-user', [
    validateJwt,
    upload.single('image')
], addNewUser);

//Get logged in user
router.get('/current', [
    validateJwt,
], getCurrentUser)

//Get all users page
router.get('/all/page', [
    validateJwt,
], getAllUsersPage)

router.get('/iflogged', checkIfLogged)


module.exports = router;