const { Router } = require('express');
const validateJwt = require('../middlewares/validateJwt');
const { getNotice, getData } = require('../controllers/legal');

const router = Router();

router.get('/notice',[
    validateJwt,
], getNotice);

router.get('/data',[
    validateJwt,
], getData);

module.exports = router;