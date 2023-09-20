const multer = require("multer");
const path = require('path');

const userImageStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './public/assets/usersImgs')
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname))
    }
});

const userImageUpload = multer({
    storage: userImageStorage,
    limits: {
        fileSize: 1024 * 1024 * 10, // 10 MB
    }
});

const unitImageStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './public/assets/unitsImgs')
    },
    filename: (req, file, cb) => {
        cb(null, req.params.resourceId + path.extname(file.originalname))
    }
});

const unitImageUpload = multer({
    storage: unitImageStorage,
    limits: {
        fileSize: 1024 * 1024 * 10, // 10 MB
    }
});


module.exports = {
    userImageUpload: userImageUpload,
    unitImageUpload: unitImageUpload
};
