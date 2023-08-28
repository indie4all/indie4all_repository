const multer = require("multer");
const path = require('path');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './public/assets/usersImgs')
    },
    filename: (req, file, cb) => {
        console.log(file);
        cb(null, Date.now() + path.extname(file.originalname))
    }
});

module.exports = multer({
    storage: storage,
    limits: {
      fileSize: 1024 * 1024 * 10, // 10mb max size,
    }
  });
