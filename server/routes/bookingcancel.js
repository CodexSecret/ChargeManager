const express = require("express");
const nodemailer = require("nodemailer");
const router = express.Router();
const { Booking } = require("../models");
const { validateToken } = require("../middlewares/auth");
const dayjs = require("dayjs");
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

router.post("/:id", validateToken, async (req, res) => {
    const source = fs.readFileSync("./public/views/bookingcancel.hbs", "utf8");
    const template = handlebars.compile(source);

    const id = req.params.id;

    try {
        const booking = await Booking.findByPk(id);

        if (!booking) {
            res.sendStatus(404);
            return;
        }

        const htmlContent = template({
            title: "Booking Cancellation",
            heading: "Cancelled Booking",
            name: booking.userName,
            carmodel: booking.carModelNew,
            licenseplate: booking.licenseNew,
            location: booking.locationNew,
            insurance: booking.insurance ? "Insurance" : "",
            childbooster: booking.childBooster ? "Child Booster" : "",
            cardinfo: booking.paymentNumber.slice(-4),
            formattedStartDate: dayjs(booking.startDate).format(
                "dddd, MMMM D YYYY"
            ),
            formattedEndDate: dayjs(booking.endDate).format(
                "dddd, MMMM D YYYY"
            ),
            formattedCreatedAt: dayjs(booking.createdAt).format(
                "dddd, MMMM D YYYY"
            ),
            totalcost: booking.totalCost,
            year: new Date().getFullYear(),
        });

        const message = {
            from: process.env.EMAIL_USER,
            to: booking.userEmail,
            subject: `Booking Cancellation Details - ${booking.carModelNew}`,
            html: htmlContent,
        };

        const info = await transporter.sendMail(message);
        console.log("Message sent: %s", info.messageId);

        res.json({
            success: true,
            messageId: info.messageId,
            booking: booking,
        });
    } catch (error) {
        console.error("Error sending email:", error);
        res.status(500).json({ message: "Error sending email" });
    }
});

module.exports = router;
