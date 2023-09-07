const express = require("express");
const nodemailer = require("nodemailer");
const router = express.Router();
const { validateToken } = require('../middlewares/auth');
const handlebars = require("handlebars");
const fs = require("fs");

// Create a SMTP transporter object
let transporter = nodemailer.createTransport({
    host: "smtp-relay.brevo.com",
    port: 587,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
    debug: true,
    tls: {
        rejectUnauthorized: false,
    },
});

router.post("/", validateToken, async (req, res) => {
    const source = fs.readFileSync("./public/views/reviewreport.hbs", "utf8");
    const template = handlebars.compile(source);

    let data = req.body;
    try {
        const htmlContent = template({
            title: "Charge Account Warning - Inappropriate Behaviour on Review",
            heading: "Charge Account Warning - Inappropriate Behaviour on Review",
            model: data.CarModel,
            review: data.Review,
            category: data.Category,
            description: data.Description,
            year: new Date().getFullYear(),
        });


        const message = {
            from: process.env.EMAIL_USER,
            to: data.Email,
            subject: `Charge Account Warning - Inappropriate Behaviour on Review`, 
            html: htmlContent,
            attachments: [{
                filename: `${data.ImageFile}`,
                path: `../server/public/uploads/${data.ImageFile}`,
                cid: 'unique@nodemailer.com' //same cid value as in the html img src
            }],
        };
        
        const info = await transporter.sendMail(message);
        console.log("Message sent: %s", info.messageId);
        res.json({ success: true, messageId: info.messageId });
    } catch (error) {
        console.error("Error sending report email:", error);
        res.status(500).json({ message: "Error sending report email" });
    }
});

module.exports = router;
