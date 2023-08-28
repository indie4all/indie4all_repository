const { response, request } = require('express');
const Unit = require('../models/unit');
const fs = require('fs-extra');
const { exec } = require('child_process');
const sass = require('sass');
const path = require('path');
const User = require('../models/user');

const VALID_COVER_PATTERN = /^data:([-\w.]+\/[-\w.+]+)?;base64,[A-Za-z0-9+/]*={0,2}$/;
const VALID_COLOR_PATTERN = /^#[0-9a-fA-F]{6}$/;

const getUnits = async (req = request, res = response) => {

    console.info('Retrieving all the units...');

    //Retrieve the user role
    const loggedInUser = await User.findOne({ '_id': req.uid }).lean();
    console.log(loggedInUser)

    //Retreieve page number from params
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;

    //Check if the user is admin and have access to 'Users' tab
    let allUnits = null;
    if (loggedInUser.role == 'ADMIN_ROLE') {
        allUnits = await Unit.paginate({}, { page, limit });
    } else {
        allUnits = await Unit.paginate({ 'email': loggedInUser.email }, { page, limit });
    }

    res.json({
        allUnits: allUnits.docs,
        currentPage: page,
        totalPages: allUnits.totalPages,
    })
}

const addUnit = async (req = request, res = response) => {
    //TO DO
    console.info('Adding unit...');

    const resourceId = req.body.resourceId;

    const unit = await Unit.findOne({ 'resourceId': resourceId }).lean();

    if(unit) {
        console.log('Unidad');
    }else {
        console.log();

    }

    console.log(resourceId);

    res.json({
        msg: 'Ruta /units/add',
        body: body
    })
}


const deleteUnit = async (req = request, res = response) => {

    console.info('Deleting unit...');

    const resourceId = req.query.resourceId;
    const unit = await Unit.findOneAndDelete({ 'resourceId': resourceId });

    res.json({
        unit: unit
    })
}

const getEditUnitForm = async (req = request, res = response) => {

    console.log("Rendering edit unit form...");

    const resourceId = req.params.resourceId;
    const unit = await Unit.findOne({ 'resourceId': resourceId }).lean();

    res.render('unit/editUnit', {
        unit
    });
}

const getAllUnitsPage = async (req = request, res = response) => {

    console.log("Rendering all units page...");

    res.render('unit/allUnits', { layout: 'layout' });
}

const saveEditedUnit = async (req = request, res = response) => {

    //TO DO
    console.log("Saving edited unit...");

    const body = req.body;
    console.log(body);

    res.json({
        body
    })
}


const generateContent = async (req = request, res = response) => {

    console.info('Generating content...');


    const resourceId = req.query.resourceId;
    console.log(resourceId)

    //Retrieve unit to use it as example
    const unit = await Unit.findOne({ 'resourceId': resourceId });
    console.log(unit)

    //Steps:
    //1. Ver si existe la carpeta de la unidad seleccionada
    const unitPath = path.join('public', unit.resourceId);
    const directoryExists = fs.existsSync(unitPath);

    if (directoryExists) {
        console.log('Directory exists.');
    } else {
        //Si no existe
        console.log('Directory does not exist.');

        //Creo la carpeta public/unit-resourceId
        await createFolder(unitPath);

        //Creo el archivo json de la unidad
        await createJsonFile(unit);

        //Creo el archivo del estilo stylesCustom.min.css
        await createStyleFile("assets", unit.color, unit.cover);

        //Copy assets folder to unit subfolder
        await copyAssetsToUnitFolder(unit.resourceId);

        //Generar codigo de la unidad con su index.html dentro de la carpeta con su resourceId -> ejecutar generador jar
        await createUnit(unit.resourceId);
    }
    res.json({
        resourceId: resourceId
    });
}

const copyAssetsToUnitFolder = async (resourceId) => {

    const rootFolderPath = process.cwd();
    const assetsFolderPath = path.join(rootFolderPath, 'assets');
    const unitSubFolderPath = path.join(rootFolderPath, 'public', resourceId, 'assets');

    fs.copy(assetsFolderPath, unitSubFolderPath, (err) => {
        if (err) {
            console.error('An error occurred while copying the assets folder to the unit sub-folder:', err);
            console.log(err);
        } else {
            console.log('Assets folder copied successfully.');
        }
    });

}

const createUnit = async (resourceId) => {

    //Use that file to execute contentgenerator.jar and generate the content

    const command = `java -Dfile.encoding=UTF-8 -jar ./contentgenerator.jar public/assets/units/${resourceId}.json public/${resourceId}`;

    exec(command, (error, stdout, stderr) => {
        if (error) {
            console.error('Error while generating Unit:', error);
            return;
        }
        // El comando Java se ejecutó correctamente
        console.log('Salida estándar:', stdout);
        console.error('Salida de error:', stderr);
    });
}

const createFolder = async (folderPath) => {
    fs.mkdir(folderPath, { recursive: true }, (err) => {
        if (err) {
            console.error('An error occurred while creating the folder:');
            console.log(err)
        } else {
            console.log('Folder created successfully.');
        }
    });
}

const createJsonFile = async (unit) => {

    //Parse unit to json
    const jsonUnit = JSON.stringify(unit, null, 2);

    //Create json file
    fs.writeFile(`public/assets/units/${unit.resourceId}.json`, jsonUnit, 'utf8', (err) => {
        if (err) {
            console.error('Error while writing JSON file:', err);
        } else {
            console.log('JSON file successfully saved.');
        }
    });
}

//Method tu generate the theme style of the unit
const createStyleFile = async function (folder, color, cover) {

    console.info("Generating theme style");

    // Generate the css of the current theme
    const realColor = VALID_COLOR_PATTERN.test(color) ? color : '#000000';
    const realCover = VALID_COVER_PATTERN.test(cover) ? cover : 'data:null';

    const sassCode = `$base-color: ${realColor}; $base-url: "${realCover}"; @import 'theme.scss';`;
    const scssFilePath = folder + '/generator/content/v4-7-5/css/temporaryStyles.scss'
    const cssFilePath = folder + '/generator/content/v4-7-5/css/stylesCustom.min.css';

    console.log(scssFilePath);
    console.log(cssFilePath);

    fs.writeFile(scssFilePath, sassCode, function (err) {
        if (err) {
            console.error(err);
        } else {
            console.info('SCSS file created correctly.');
            sass.render({
                file: scssFilePath,
                outputStyle: 'compressed'
            }, function (error, result) {
                if (error) {
                    console.error(error);
                } else {
                    fs.writeFile(cssFilePath, result.css, function (err) {
                        if (err) {
                            console.error('Error while compiling SCSS to CSS :', err);
                            console.error(err);
                        } else {
                            console.log(`Successfully compiled Sass to CSS. Output file: ${cssFilePath}`);
                            //Remove scss file
                            fs.unlink(scssFilePath, function (err) {
                                if (err) {
                                    console.error('Error while removing SCSS file :', err);
                                } else {
                                    console.log(' SCSS file removed successfully.');
                                }
                            });
                        }
                    });
                }
            });
        }
    });
}

const getRandomUnits = async (req = request, res = response) => {

    console.log("Getting random units...");

    const amount = parseInt(req.query.amount);

    let response = {};

    try {
        const totalUnits = await Unit.countDocuments();

        if (totalUnits <= amount) {
            response.flag = 0;
            response.units = [];
        } else {
            const selectedIndices = new Set();

            while (selectedIndices.size < amount) {
                selectedIndices.add(Math.floor(Math.random() * totalUnits));
            }

            //const allowDiskUse = { allowDiskUse: true }
            const selectedUnits = await Unit.aggregate([{ $sample: { size: amount } }]).allowDiskUse(true);


            response.flag = 1;
            response.units = selectedUnits;

        }

        res.json({ response: response });

    } catch (error) {
        console.error('Error getting random documents:', error);
    }

}

module.exports = {
    getUnits,
    addUnit,
    generateContent,
    deleteUnit,
    getEditUnitForm,
    saveEditedUnit,
    getAllUnitsPage,
    getRandomUnits
}