const express = require("express");
const router = express.Router();
// const { validateToken } = require("../middlewares/auth");
const { upload } = require("../middlewares/upload");
const { chatupload } = require("../middlewares/chatupload");
router.post("/upload", upload, (req, res) => {
    res.json({ filename: req.file.filename });
});
router.post("/chatupload", chatupload, (req, res) => {
    res.json({ filename: req.file.filename });
});
module.exports = router;
