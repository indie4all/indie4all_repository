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

    //Check if unit already exists
    const unitExists = await Unit.findOne({ 'resourceId': resourceId }).lean();
    if (unitExists) {
        console.info('Unit already exists');
        res.status(409).json({ message: 'Unit already exists' });
    } else {
        const body = req.body;
        const newUnit = new Unit({
            ...body
        });

        //Save new unit in the database
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

    let unitImage = unit.cover;

    if (req.file) {

        const newImagePath = req.file.path;

        const rootFolderPath = process.cwd();
        const newImageRelativePath = path.join(rootFolderPath, newImagePath);

        unitImage = await convertFileToBase64(newImageRelativePath);
    }


    const newColor = req.body.color ? req.body.color : unit.color;

    const updatedUnit = {
        ...unit,
        title: req.body.title,
        cover: unitImage,
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

        await fs.unlink(newImageRelativePath);
        console.info('Unit image removed successfully');

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

    const unitPath = path.join('public', unit.resourceId);
    const directoryExists = fs.existsSync(unitPath);

    if (directoryExists) {
        console.info(`Directory ${unitPath} exists.`);
    } else {

        console.info(`Directory ${unitPath} does not exists.`);

        await createFolder(unitPath);

        await createJsonFile(unit);

        await createStyleFile("assets", unit.color, unit.cover);

        await copyAssetsToUnitFolder(unit.resourceId);

        await createUnit(unit.resourceId);
    }
    res.json({
        resourceId: resourceId
    });
}

async function copyAssetsToUnitFolder(resourceId) {

    const rootFolderPath = process.cwd();
    const assetsFolderPath = path.join(rootFolderPath, 'assets');
    const unitSubFolderPath = path.join(rootFolderPath, 'public', resourceId, 'assets');

    fs.copy(assetsFolderPath, unitSubFolderPath, (err) => {
        if (err) {
            console.error('An error occurred while copying the assets folder to the unit sub-folder:', err);
            console.error(err);
        } else {
            console.info('Assets folder copied successfully.');
        }
    });

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

async function createStyleFile(folder, color, cover) {

    console.info("Generating theme style");

    const realColor = VALID_COLOR_PATTERN.test(color) ? color : '#000000';
    const realCover = VALID_COVER_PATTERN.test(cover) ? cover : 'data:null';

    const sassCode = `$base-color: ${realColor}; $base-url: "${realCover}"; @import 'theme.scss';`;
    const scssFilePath = folder + '/generator/content/v4-7-5/css/temporaryStyles.scss'
    const cssFilePath = folder + '/generator/content/v4-7-5/css/stylesCustom.min.css';

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
                        } else {
                            console.info(`Successfully compiled Sass to CSS. Output file: ${cssFilePath}`);
                            fs.unlink(scssFilePath, function (err) {
                                if (err) {
                                    console.error('Error while removing SCSS file :', err);
                                } else {
                                    console.info(' SCSS file removed successfully.');
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

    console.info("Getting random units...");

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