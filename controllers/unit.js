const { response, request } = require('express');
const Unit = require('../models/unit');

const getUnits = async (req = request, res = response) => {

    console.info('Hola, estas en el /units/all y la ruta funciona perfectamente')

    //Retrieve all the units
    const allUnits = await Unit.find({}).lean();

    allUnits.forEach(unit => {

    });
    
    for (let i = 0; i < allUnits.length; i++) {
        const { sections, ...rest } = allUnits[i];
        allUnits[i] = rest;
        console.log(allUnits[i]);
        
    }

    res.json({
        allUnits: allUnits
    })
}

const addUnit = async (req = request, res = response) => {

    console.info('Hola, estas en el /units/addUnit y la ruta funciona perfectamente')

    const body = req.body;

    res.json({
        msg: 'Ruta /units/addUnit',
        body: body
    })
}

module.exports = {
    getUnits,
    addUnit
}