const { response, request } = require('express');
const Unit = require('../models/unit');
const fs = require('fs-extra');
const { exec } = require('child_process');
const sass = require('sass');
const path = require('path');
const User = require('../models/user');
const util = require('util');

const VALID_COVER_PATTERN = /^data:([-\w.]+\/[-\w.+]+)?;base64,[A-Za-z0-9+/]*={0,2}$/;
const VALID_COLOR_PATTERN = /^#[0-9a-fA-F]{6}$/;

const getUnits = async (req = request, res = response) => {

    console.info('Retrieving all the units...');

    const loggedInUser = await User.findOne({ '_id': req.uid }).lean();

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;

    let allUnits = null;
    if (loggedInUser.role == 'ADMIN_ROLE') {
        allUnits = await Unit.paginate({}, {
            page,
            limit,
            select: 'resourceId title email cover'
        });
    } else {
        allUnits = await Unit.paginate({ 'email': loggedInUser.email }, {
            page,
            limit,
            select: 'resourceId title email cover'
        });
    }

    res.json({
        allUnits: allUnits.docs,
        currentPage: page,
        totalPages: allUnits.totalPages,
    })
}

const addUnit = async (req = request, res = response) => {

    console.info('Adding unit...');

    const resourceId = req.body.resourceId;

    const unitExists = await Unit.findOne({ 'resourceId': resourceId }).lean();
    if (unitExists) {
        console.info('Unit already exists');
        res.status(409).json({ message: 'Unit already exists' });
    } else {

        const body = req.body;

        let base64Image = body.cover;
        base64Image = base64Image.replace(/^data:image\/jpeg;base64,/, '');

        const folderPath = 'public\\assets\\unitsImgs\\';
        const fileName = body.resourceId + '.png';
        const completeImagePath = path.join(folderPath, fileName);

        fs.writeFile(completeImagePath, base64Image, 'base64', (err) => {
            if (err) {
                console.error('Error writing file:', err);
            } else {
                console.log('The image has been successfully saved');
            }
        });

        const basePath = 'public'
        const relativeImagePath = '/' + path.relative(basePath, completeImagePath).replace(/\\/g, '/');

        const newUnit = new Unit({
            ...body,
            cover: relativeImagePath
        });

        await newUnit.save().then(() => {
            res.status(200).json({ message: 'Unit added correctly' });
            console.info('Unit added correctly');
        }).catch(error => {
            console.error(error);
            res.status(500);
        });

    }

}

const deleteUnit = async (req = request, res = response) => {

    console.info('Deleting unit...');

    const resourceId = req.query.resourceId;
    const unit = await Unit.findOneAndDelete({ 'resourceId': resourceId });

    const unitPath = path.join('public', resourceId);
    const directoryExists = fs.existsSync(unitPath);

    //Delete generated unit folder if exists
    if (directoryExists) {
        await removeDirectoryOrFile(unitPath);
    } else {
        console.info(`Directory ${unitPath} does not exist.`);
    }

    //Delete generated json file if exists
    const jsonFilePath = `public/assets/units/${resourceId}.json`;
    const jsonFileExists = fs.existsSync(jsonFilePath);
    if (jsonFileExists) {
        await removeDirectoryOrFile(jsonFilePath);
    }

    //Delete generated upctforma file if exists
    const upctFormaFilePath = `public/assets/units/${resourceId}.upctForma`;
    const upctFormaExists = fs.existsSync(jsonFilePath);
    if (upctFormaExists) {
        //Delete json file if exists
        await removeDirectoryOrFile(upctFormaFilePath);
    }

    //Delete unit image if exists
    const unitImagePath = `public/assets/unitsImgs/${resourceId}.png`;
    const unitImageExists = fs.existsSync(unitImagePath);
    if (unitImageExists) {
        await removeDirectoryOrFile(unitImagePath);
    }

    res.json({
        unit: unit
    })
}

async function removeDirectoryOrFile(path) {
    fs.remove(path, (err) => {
        if (err) {
            console.error(`Error while deleting directory/file ${path}: `, err);
        } else {
            console.info('File or directory successfully deleted.');
        }
    });
}

const getEditUnitForm = async (req = request, res = response) => {

    console.info("Rendering edit unit form...");

    const resourceId = req.params.resourceId;
    const unit = await Unit.findOne({ 'resourceId': resourceId }).lean();

    res.render('unit/editUnit', {
        unit
    });
}

const getAllUnitsPage = async (req = request, res = response) => {

    console.info("Rendering all units page...");

    res.render('unit/allUnits', { layout: 'layout' });
}

const saveEditedUnit = async (req = request, res = response) => {

    console.info("Saving edited unit...");

    //Retrieve the edited unit
    const resourceId = req.params.resourceId;
    const unit = await Unit.findOne({ 'resourceId': resourceId }).lean();

    const newColor = req.body.color ? req.body.color : unit.color;

    const updatedUnit = {
        ...unit,
        title: req.body.title,
        user: req.body.user,
        email: req.body.email,
        institution: req.body.institution,
        language: req.body.language,
        color: newColor
    };

    //Delete generated unit folder if exists
    const unitPath = path.join('public', resourceId);
    const directoryExists = fs.existsSync(unitPath);

    if (directoryExists) {
        await removeDirectoryOrFile(unitPath)
    } else {
        console.info(`Directory ${unitPath} does not exist.`);
    }

    //Delete generated json file if exists
    const jsonFilePath = `public/assets/units/${resourceId}.json`;
    const jsonFileExists = fs.existsSync(jsonFilePath);
    if (jsonFileExists) {
        await removeDirectoryOrFile(jsonFilePath);
    }

    //Delete generated upctforma file if exists
    const upctFormaFilePath = `public/assets/units/${resourceId}.upctForma`;
    const upctFormaExists = fs.existsSync(jsonFilePath);
    if (upctFormaExists) {
        //Delete json file if exists
        await removeDirectoryOrFile(upctFormaFilePath);
    }

    await Unit.findByIdAndUpdate(unit._id, updatedUnit).then(() => {
        res.redirect('/unit/showAll');
        console.info('Unit edited succesfully');
    }).catch(error => {
        console.error(error);
    });

}

async function convertFileToBase64(newImageRelativePath) {
    try {
        const data = await fs.readFile(newImageRelativePath);
        const unitImage = 'data:image\/jpeg;base64,' + data.toString('base64');
        console.info('Unit image converted to base64 correctly');

        return unitImage;
    } catch (err) {
        console.error('Error:', err);
        return null;
    }
}

const generateContent = async (req = request, res = response) => {

    console.info('Generating content...');

    const resourceId = req.query.resourceId;

    //Retrieve unit to use it as example
    const unit = await Unit.findOne({ 'resourceId': resourceId });

    const basePath = 'public';
    const newImageRelativePath = path.join(basePath, unit.cover);
    unit.cover = await convertFileToBase64(newImageRelativePath);

    const unitPath = path.join('public', unit.resourceId);
    const directoryExists = fs.existsSync(unitPath);

    if (directoryExists) {
        console.info(`Directory ${unitPath} exists.`);
    } else {

        console.info(`Directory ${unitPath} does not exists.`);

        let promisesArray = [
            createFolder(unitPath),
            copyAssetsToUnitFolder(unit.resourceId),
            createJsonFile(unit),
            createStyleFile("assets", unit.color, unit.cover),
            createUnit(unit.resourceId),

        ];

        try {
            await Promise.all(promisesArray);
            console.log('All promises executed successfully');
        } catch (error) {
            console.error(error);
        }
    }

    res.json({
        resourceId: resourceId
    });
}

const copyFileAsync = util.promisify(fs.copy);

async function copyAssetsToUnitFolder(resourceId) {
    try {
        const rootFolderPath = process.cwd();
        const assetsFolderPath = path.join(rootFolderPath, 'assets');
        const unitSubFolderPath = path.join(rootFolderPath, 'public', resourceId, 'assets');

        await copyFileAsync(assetsFolderPath, unitSubFolderPath);
        console.info('Assets folder copied successfully.');
    } catch (error) {
        console.error('An error occurred while copying the assets folder to the unit sub-folder:', error);
    }
}

async function createUnit(resourceId) {

    const command = `java -Dfile.encoding=UTF-8 -jar ./contentgenerator.jar public/assets/units/${resourceId}.json public/${resourceId}`;

    exec(command, (error, stdout, stderr) => {
        if (error) {
            console.error('Error while generating Unit:', error);
            console.error('Error output ', stderr);
            return;
        }
        console.info('Standar output', stdout);

    });
}

async function createFolder(folderPath) {
    fs.mkdir(folderPath, { recursive: true }, (err) => {
        if (err) {
            console.error('An error occurred while creating the folder:', err);
        } else {
            console.info(`Folder ${folderPath} created successfully.`);
        }
    });
}

async function createJsonFile(unit) {

    const jsonUnit = JSON.stringify(unit, null, 2);

    fs.writeFile(`public/assets/units/${unit.resourceId}.json`, jsonUnit, 'utf8', (err) => {
        if (err) {
            console.error('Error while writing JSON file:', err);
        } else {
            console.info('JSON file successfully saved.');
        }
    });
}


const writeFileAsync = util.promisify(fs.writeFile);
const unlinkAsync = util.promisify(fs.unlink);

async function createStyleFile(folder, color, cover) {
    try {
        console.info("Generating theme style");

        const realColor = VALID_COLOR_PATTERN.test(color) ? color : '#000000';
        const realCover = VALID_COVER_PATTERN.test(cover) ? cover : 'data:null';

        const sassCode = `$base-color: ${realColor}; $base-url: "${realCover}"; @import 'theme.scss';`;
        const scssFilePath = folder + '/generator/content/v4-7-5/css/temporaryStyles.scss';
        const cssFilePath = folder + '/generator/content/v4-7-5/css/stylesCustom.min.css';

        await writeFileAsync(scssFilePath, sassCode);

        const result = await renderSassFile(scssFilePath);
        await writeFileAsync(cssFilePath, result.css);

        await unlinkAsync(scssFilePath);

        console.info(`Successfully compiled Sass to CSS. Output file: ${cssFilePath}`);
    } catch (error) {
        console.error('Error:', error);
    }
}

async function renderSassFile(scssFilePath) {
    return new Promise((resolve, reject) => {
        sass.render({
            file: scssFilePath,
            outputStyle: 'compressed'
        }, (error, result) => {
            if (error) {
                reject(error);
            } else {
                resolve(result);
            }
        });
    });
}


function smallestMultipleOfNine(number, target) {
    if (number < target) {
        return 0;
    }
    const returnedNumber = Math.floor(number / target) * 9;
    return returnedNumber;
}

const getRandomUnits = async (req = request, res = response) => {

    console.info("Getting random units...");

    let amount = parseInt(req.query.amount);
    let response = {};
    try {
        const totalUnits = await Unit.countDocuments();
        if (totalUnits <= amount) {
            amount = smallestMultipleOfNine(totalUnits, 9);
        }

        if (amount == 0) {
            response.flag = 0;
            response.units = {};
            response.amountUnitsRetrieved = amount;
        } else {
            const selectedIndices = new Set();

            while (selectedIndices.size < amount) {
                selectedIndices.add(Math.floor(Math.random() * totalUnits));
            }

            const selectedUnits = await Unit.aggregate([
                { $limit: amount },
                { $sample: { size: amount } },
                {
                    $project: {
                        resourceId: 1,
                        title: 1,
                        cover: 1
                    }
                }
            ]).allowDiskUse(true);


            response.units = selectedUnits;
            response.amountUnitsRetrieved = amount;
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