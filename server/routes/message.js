const express = require('express');
const router = express.Router();
const { User, Message, Sequelize } = require('../models');
const { validateToken } = require('../middlewares/auth');
const yup = require("yup");

router.post("/:id", validateToken, async (req, res) => {
    let data = req.body;
    let id = req.params.id
    // Validate request body
    let validationSchema = yup.object().shape({
        message: yup.string().trim().min(1).max(250)
    });
    try {
        await validationSchema.validate(data, { abortEarly: false });
    }
    catch (err) {
        console.error(err);
        res.status(400).json({ errors: err.errors });
        return;
    }
    data.text = data.text.trim();
    data.chatId = id
    data.userId = req.user.id;
    data.edited = false;
    let result = await Message.create(data);
    res.json(result);
});

router.get("/", async (req, res) => {
    let list = await Message.findAll({
        order: [['createdAt', 'ASC']],
    });
    res.json(list);
});

router.get("/:id", async (req, res) => {
    let id = req.params.id;
    let message = await Message.findByPk(id, {
        include: { model: User, as: "user", attributes: ['name'] }
    });
    // Check id not found
    if (!message) {
        res.sendStatus(404);
        return;
    }
    res.json(message);
});

router.put("/:id", validateToken, async (req, res) => {
    let id = req.params.id;
    // Check id not found
    let message = await Message.findByPk(id);
    if (!message) {
        res.sendStatus(404);
        return;
    }

    // Check request user id
    let userId = req.user.id;
    if (message.userId != userId) {
        res.sendStatus(403);
        return;
    }

    let data = req.body;
    data.edited = true;
    // Validate request body
    let validationSchema = yup.object().shape({// Validation schema to define what you want to validate
        message: yup.string().trim().min(1).max(250)
    });
    try {
        await validationSchema.validate(data, { abortEarly: false });// performing validation
    }
    catch (err) {
        console.error(err);
        res.status(400).json({ errors: err.errors });// return 400 and a console of error
        return;
    }

    let num = await Message.update(data, {// peform update using sequelise
        where: { id: id }// where conding to check for the SQL
    });
    if (num == 1) {// when data is updated
        res.json({
            message: "Message was updated successfully."
        });
    }
    else {
        res.status(400).json({
            message: `Cannot update message with id ${id}.`
        });
    }
});

router.delete("/:id", validateToken, async (req, res) => {
    let id = req.params.id;
    // Check id not found
    let message = await Message.findByPk(id);
    if (!message) {
        res.sendStatus(404);
        return;
    }

    // Check request user id
    let userId = req.user.id;
    if (message.userId != userId) {
        res.sendStatus(403);
        return;
    }
    
    let num = await Message.destroy({
        where: { id: id }
    })
    if (num == 1) {
        res.json({
            message: "Message was deleted successfully."
        });
    }
    else {
        res.status(400).json({
            message: `Cannot delete message with id ${id}.`
        });
    }
});

module.exports = router;