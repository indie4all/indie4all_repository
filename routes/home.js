const { Router } = require('express');
const { home } = require('../controllers/home');
const validateJwt = require('../middlewares/validateJwt');

const router = Router();

router.get('/',[
    validateJwt
], home);

module.exports = router;