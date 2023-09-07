const multer = require("multer");
const { nanoid } = require("nanoid");
const path = require("path");
const storage = multer.diskStorage({
    destination: (req, file, callback) => {
        callback(null, "./public/chatImages/");
    },
    filename: (req, file, callback) => {
        callback(null, nanoid(10) + path.extname(file.originalname));
    },
});
const chatupload = multer({
    storage: storage,
    limits: { fileSize: 1024 * 1024 * 10},
}).single("file"); // file input name
module.exports = { chatupload };