const express = require("express");
const nodemailer = require("nodemailer");
const router = express.Router();
const { User, Sequelize } = require("../models");
const { validateToken } = require("../middlewares/auth");
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
    const source = fs.readFileSync(
        "./public/views/rewardredemption.hbs",
        "utf8"
    );
    const template = handlebars.compile(source);

    let data = req.body;
    let id = req.user.id;
    let email = req.user.email;

    try {
        const user = await User.findOne({ where: { id } });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const rewardCode =
            "CRG" + Math.floor(Math.random() * 99999999999999999).toString();
        user.rewardPoints = user.rewardPoints - data.pointRequirement;

        await user.save();

        const htmlContent = template({
            title: `Charge Reward Redemption  - ${data.rewardName}`,
            heading:
                `Charge Reward Redemption - ${data.rewardName}`,
            rewardname: data.rewardName,
            rewardcode: rewardCode,
            year: new Date().getFullYear(),
        });

        const message = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: `Charge Reward Redemption - ${data.rewardName}`,
            html: htmlContent,
        };

        const info = await transporter.sendMail(message);
        console.log("Message sent: %s", info.messageId);
        res.json({ success: true, messageId: info.messageId });
    } catch (error) {
        console.error("Error in sending email:", error);
        res.status(500).json({ message: "Error in email sending" });
    }
});

module.exports = router;
