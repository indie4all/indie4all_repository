const { Router } = require('express');
const { getUnits,
    addUnit,
    generateContent } = require('../controllers/unit');
const validateJwt = require('../middlewares/validateJwt');
const { check } = require('express-validator');
const { validateFields } = require('../middlewares/validateFields');

const router = Router();

router.get('/all', [
    validateJwt,
    check('page', 'Page parameter should be an integer').isInt(),
    validateFields
], getUnits);

router.get('/generate', generateContent);


router.post('/addUnit', addUnit); //TO DO

module.exports = router;