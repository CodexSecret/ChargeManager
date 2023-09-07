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

router.post("/deletion/:id", async (req, res) => {
    const source = fs.readFileSync("./public/views/deletion.hbs", "utf8");
    const template = handlebars.compile(source);
    const id = req.params.id;
    let user = await User.findByPk(id);
    if (!user) {
        res.sendStatus(404);
        return;
    }

    if (user.isBanned) {
        res.status(400).json({
            message: `Cannot send a message to a banned account with id ${id}.`,
        });
        return;
    }

    let email = user.email;

    const htmlContent = template({
        title: "Charge Account Deletion Notification",
        heading: "Your Charge Account has been deleted.",
        userid: user.id,
        username: user.username,
        userfullname: user.name,
        year: new Date().getFullYear(),
    });

    const message = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: "Charge Account Deletion Notification",
        html: htmlContent,
    };

    const info = await transporter.sendMail(message);
    console.log("Message sent: %s", info.messageId);
    res.json({ success: true, messageId: info.messageId });
});

router.post("/admindeletion/:id", async (req, res) => {
    const source = fs.readFileSync("./public/views/admindeletion.hbs", "utf8");
    const template = handlebars.compile(source);
    const id = req.params.id;
    let user = await User.findByPk(id);
    if (!user) {
        res.sendStatus(404);
        return;
    }

    if (user.isBanned) {
        res.status(400).json({
            message: `Cannot send a message to a banned account with id ${id}.`,
        });
        return;
    }

    let email = user.email;

    const htmlContent = template({
        title: "Charge Account Deletion Notification",
        heading: "Your Charge Account has been deleted by an Admin",
        userid: user.id,
        username: user.username,
        userfullname: user.name,
        year: new Date().getFullYear(),
    });

    const message = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: "Charge Account Deletion Notification - Admin",
        html: htmlContent,
    };

    const info = await transporter.sendMail(message);
    console.log("Message sent: %s", info.messageId);
    res.json({ success: true, messageId: info.messageId });
});

router.post("/restoration/:id", async (req, res) => {
    const source = fs.readFileSync("./public/views/restore.hbs", "utf8");
    const template = handlebars.compile(source);
    const id = req.params.id;
    let user = await User.findByPk(id, { paranoid: false });

    if (!user) {
        res.sendStatus(404);
        return;
    }

    if (user.isBanned) {
        res.status(400).json({
            message: `Cannot send a message to a banned account with id ${id}.`,
        });
        return;
    }

    let email = user.email;

    const htmlContent = template({
        title: "Charge Account Restoration Notification",
        heading: "Your Charge Account has been restored by an Admin",
        userid: user.id,
        username: user.username,
        userfullname: user.name,
        year: new Date().getFullYear(),
    });

    const message = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: "Charge Account Restoration Notification",
        html: htmlContent,
    };

    const info = await transporter.sendMail(message);
    console.log("Message sent: %s", info.messageId);
    res.json({ success: true, messageId: info.messageId });
});

router.post("/ban/:id", async (req, res) => {
    const source = fs.readFileSync("./public/views/ban.hbs", "utf8");
    const template = handlebars.compile(source);
    const id = req.params.id;
    let user = await User.findByPk(id);

    if (!user) {
        res.sendStatus(404);
        return;
    }

    if (user.isBanned) {
        res.status(400).json({
            message: `Cannot send a message to a banned account with id ${id}.`,
        });
        return;
    }

    let email = user.email;

    const htmlContent = template({
        title: "Charge Account Ban Notification",
        heading: "Your Charge Account has been banned for violating our terms of service.",
        userid: user.id,
        username: user.username,
        userfullname: user.name,
        year: new Date().getFullYear(),
    });

    const message = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: "Charge Account Ban Notification",
        html: htmlContent,
    };

    const info = await transporter.sendMail(message);
    console.log("Message sent: %s", info.messageId);
    res.json({ success: true, messageId: info.messageId });
});

router.post("/unban/:id", async (req, res) => {
    const source = fs.readFileSync("./public/views/unban.hbs", "utf8");
    const template = handlebars.compile(source);
    const id = req.params.id;
    let user = await User.findByPk(id);

    if (!user) {
        res.sendStatus(404);
        return;
    }

    if (!user.isBanned) {
        res.status(400).json({
            message: `Cannot send a message to a non-banned account with id ${id}.`,
        });
        return;
    }

    let email = user.email;

    const htmlContent = template({
        title: "Charge Account Unban Notification",
        heading:
            "Your Charge Account has been unbanned after some consideration.",
        userid: user.id,
        username: user.username,
        userfullname: user.name,
        year: new Date().getFullYear(),
    });

    const message = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: "Charge Account Unban Notification",
        html: htmlContent,
    };

    const info = await transporter.sendMail(message);
    console.log("Message sent: %s", info.messageId);
    res.json({ success: true, messageId: info.messageId });
});

module.exports = router;
