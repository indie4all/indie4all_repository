const { Router } = require('express');
const { getUnits,
    addUnit } = require('../controllers/unit');
const validateJwt = require('../middlewares/validateJwt');
const express = require('express');

const router = Router();

router
    .get('/all', getUnits)
    .post('/addUnit', express.json({ limit: '50000000000mb' }), addUnit);

module.exports = router;