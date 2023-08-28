const { Router } = require('express');
const { getUnits,
    addUnit,
    generateContent,
    deleteUnit,
    getEditUnitForm,
    saveEditedUnit,
    getAllUnitsPage,
    getRandomUnits } = require('../controllers/unit');
const validateJwt = require('../middlewares/validateJwt');
const { check } = require('express-validator');
const { validateFields } = require('../middlewares/validateFields');

const router = Router();

router.get('/all', [
    validateJwt,
    check('page', 'Page parameter should be an integer').isInt(),
    check('limit', 'Limit parameter should be an integer').isInt(),
    validateFields
], getUnits);

router.get('/generatecontent', [
    check('resourceId', 'Resource Id parameter is mandatory').not().isEmpty(),
    validateFields
], generateContent);

router.post('/add', [
    validateJwt,
], addUnit); // TO DO

//Edit unit end-points
router.get('/edit/:resourceId', [
    validateJwt,
    check('resourceId', 'Resource Id parameter is mandatory').not().isEmpty(),
    validateFields
], getEditUnitForm)

router.post('/edit/:resourceId', [
    validateJwt,
    check('resourceId', 'Resource Id parameter is mandatory').not().isEmpty(),
    validateFields
], saveEditedUnit); // TO DO

router.delete('/delete', [
    validateJwt,
    check('resourceId', 'Resource Id parameter is mandatory').not().isEmpty(),
    validateFields
], deleteUnit);

//Get all units page
router.get('/showAll', [
    validateJwt
], getAllUnitsPage);

//Get certain amount of random units
router.get('/random', [
    check('amount', 'Amount parameter should be an integer').isInt(),
], getRandomUnits);

module.exports = router;