const multer = require("multer");
const path = require("path");

const fileStorageEngine = multer.diskStorage({

    destination: (req, file, cb) => {

        let ext = path.extname(file.originalname);
        if (ext !== ".png" && ext !== ".jpg" && ext !== ".gif" && ext !== ".jpeg") {
            return cb(new Error("Images Only Allowed"));
        }
        cb(null, path.join(__dirname, "../public/uncroppedImages"));
    },

    filename: (req, file, cb) => {
        cb(null, Date.now() + "--" + file.originalname);
    },

});

const maxSize = 20 * 1024 * 1024;
const upload = multer({ storage: fileStorageEngine, limits : { fileSize : maxSize } });

module.exports = upload;    