const express = require('express');
const router = express.Router();
const { User, Branch, Sequelize } = require('../models');
const yup = require("yup");
const { validateToken } = require('../middlewares/auth');

router.post("/", validateToken, async (req, res) => {
    let data = req.body;
    // Validate request body 
    let validationSchema = yup.object().shape({
        nickname: yup.string().trim().min(3).max(100).required(),
        address: yup.string().trim().min(3).max(500).required()
    });
    try {
        await validationSchema.validate(data,
            { abortEarly: false, strict: true });
    }
    catch (err) {
        console.error(err);
        res.status(400).json({ errors: err.errors });
        return;
    }
    data.nickname = data.nickname.trim();
    data.address = data.address.trim();
    data.userId = req.user.id;
    let result = await Branch.create(data);
    res.json(result);
});

router.get("/", validateToken, async (req, res) => {
    let condition = {};
    let search = req.query.search;

    if (search) {
        condition[Sequelize.Op.or] = [
            { nickname: { [Sequelize.Op.like]: `%${search}%` } },
            { address: { [Sequelize.Op.like]: `%${search}%` } }
        ];
    }

    let list = await Branch.findAll({
        where: condition,
        order: [['createdAt', 'DESC']],
        include: { model: User, as: "user", attributes: ['name'] }
    });
    res.json(list);
});


router.get("/:id", validateToken, async (req, res) => {
    let id = req.params.id;
    let branch = await Branch.findByPk(id);
    // Check id not found 
    if (!branch) {
        res.sendStatus(404);
        return;
    }
    res.json(branch);
});

router.put("/:id", validateToken, async (req, res) => {
    let id = req.params.id;
    // Check id not found 
    let branch = await Branch.findByPk(id, {
        include: { model: User, as: "user", attributes: ['name'] }
    });
    if (!branch) {
        res.sendStatus(404);
        return;
    }

    // Check request user id 
    let userId = req.user.id;
    if (branch.userId != userId) {
        res.sendStatus(403);
        return;
    }
    let data = req.body;
    // Validate request body 
    let validationSchema = yup.object().shape({
        nickname: yup.string().trim().min(3).max(100).required(),
        address: yup.string().trim().min(3).max(500).required()
    });
    try {
        await validationSchema.validate(data,
            { abortEarly: false, strict: true });
    }
    catch (err) {
        console.error(err);
        res.status(400).json({ errors: err.errors });
        return;
    }
    data.nickname = data.nickname.trim();
    data.address = data.address.trim();
    let num = await Branch.update(data, {
        where: { id: id }
    });
    if (num == 1) {
        res.json({
            message: "Branch was updated successfully."
        });
    }
    else {
        res.status(400).json({
            message: `Cannot update branch with id ${id}.`
        });
    }
});

router.delete("/:id", validateToken, async (req, res) => {
    let id = req.params.id;
    let num = await Branch.destroy({
        where: { id: id }
    })
    if (num == 1) {
        res.json({
            message: "Branch was deleted successfully."
        });
    }
    else {
        res.status(400).json({
            message: `Cannot delete branch with id ${id}.`
        });
    }
});

module.exports = router;