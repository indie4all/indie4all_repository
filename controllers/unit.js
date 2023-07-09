const { response, request } = require('express');
const Unit = require('../models/unit');
const fs = require('fs');
const { exec } = require('child_process');

const getUnits = async (req = request, res = response) => {

    console.info('Hola, estas en el /units/all y la ruta funciona perfectamente')

    //Retreieve page number from params
    const page = parseInt(req.query.page) || 1;
    const limit = 10;

    //Retrieve all the units
    const { docs, totalDocs, totalPages } = await Unit.paginate({}, { page, limit });

    res.json({
        allUnits: docs,
        currentPage: page,
        totalPages: totalPages,
    })
}

const addUnit = async (req = request, res = response) => {
    //TO DO
    console.info('Hola, estas en el /units/addUnit y la ruta funciona perfectamente')

    const body = req.body;

    res.json({
        msg: 'Ruta /units/addUnit',
        body: body
    })
}

const generateContent = async (req = request, res = response) => {

    console.info('Generating content...');


    //Retrieve unit to use it as example
    const page = 1;
    const limit = 1;

    const unit = await Unit.findOne();

    //Write json unit into a file
    const jsonString = JSON.stringify(unit, null, 2);
    //const content = JSON.stringify(docs); // Convierte el objeto en una cadena JSON con formato legible (null y 2 son para espaciado)

    fs.writeFile('public/assets/unit/unit.json', jsonString, 'utf8', (err) => {
        if (err) {
            console.error('Error al escribir el archivo JSON:', err);
        } else {
            console.log('Archivo JSON guardado correctamente.');
        }
    });

    //Use that file to execute contentgenerator.jar and generate the content

    const command = 'java -Dfile.encoding=UTF-8 -jar ./contentgenerator.jar unit.json public';

    exec(command, (error, stdout, stderr) => {
        if (error) {
            console.error('Error al ejecutar el comando Java:', error);
            return;
        }
        // El comando Java se ejecutó correctamente
        console.log('Salida estándar:', stdout);
        console.error('Salida de error:', stderr);
    });



    res.json({
        msg: 'Generando contenido de la unidad',
        docs: unit
    })

}

module.exports = {
    getUnits,
    addUnit,
    generateContent
}