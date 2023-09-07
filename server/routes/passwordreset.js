const express = require("express");
const nodemailer = require("nodemailer");
const crypto = require("crypto");
const router = express.Router();
const { User, Sequelize } = require("../models");
const bcrypt = require("bcrypt");
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

router.post("/", async (req, res) => {
    const source = fs.readFileSync("./public/views/passwordreset.hbs", "utf8");
    const template = handlebars.compile(source);

    const { email } = req.body;

    try {
        const user = await User.findOne({ where: { email } });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        if (user.isBanned) {
            res.status(400).json({ message: "Account is banned." });
            return;
        }
        if (user.isAdmin) {
            res.status(400).json({ message: "Unable to reset Admin Passwords" });
            return;
        }

        const password = crypto.randomBytes(8).toString("hex");

        user.password = password.trim();
        user.password = await bcrypt.hash(password, 10);

        await user.save();

        const htmlContent = template({
            title: "Password Reset for Charge",
            heading: "Charge Password Reset",
            content: `Your password has been reset to: ${password}`,
            year: new Date().getFullYear(),
        });

        const message = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: "Password Reset for Charge",
            html: htmlContent,
        };

        const info = await transporter.sendMail(message);
        console.log("Message sent: %s", info.messageId);
        res.json({ success: true, messageId: info.messageId });
    } catch (error) {
        console.error("Error updating user password:", error);
        res.status(500).json({ message: "Error updating password" });
    }
});

module.exports = router;
