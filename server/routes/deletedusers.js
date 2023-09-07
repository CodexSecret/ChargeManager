const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const { User, Sequelize } = require("../models");
const yup = require("yup");
const { sign } = require("jsonwebtoken");
const { validateToken } = require("../middlewares/auth");
require("dotenv").config();

router.get("/", async (req, res) => {
    let condition = {};
    let search = req.query.search;

    if (search) {
        condition[Sequelize.Op.or] = [
            { id: { [Sequelize.Op.like]: `%${search}%` } },
            { name: { [Sequelize.Op.like]: `%${search}%` } },
            { username: { [Sequelize.Op.like]: `%${search}%` } },
            { email: { [Sequelize.Op.like]: `%${search}%` } },
        ];
    }

    try {
        let list = await User.findAll({
            where: {
                ...condition,
                deletedAt: {
                    [Sequelize.Op.not]: null,
                },
            },
            order: [["id", "DESC"]],
            paranoid: false,
        });
        res.json(list);
    } catch (error) {
        console.error("Error fetching user list:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

router.put("/restore/:id", async (req, res) => {
    const id = req.params.id;

    try {
        const user = await User.findByPk(id, { paranoid: false });

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        await user.restore();

        res.json({ message: "User restored successfully" });
    } catch (error) {
        console.error("Error restoring user:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

module.exports = router;
