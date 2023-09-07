const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const { User, Sequelize } = require("../models");
const yup = require("yup");
const { sign } = require("jsonwebtoken");
const { validateToken } = require("../middlewares/auth");
require("dotenv").config();
const handlebars = require("handlebars");
const fs = require("fs");

router.post("/register", async (req, res) => {
    let data = req.body;
    // Validate request body
    let validationSchema = yup.object().shape({
        name: yup
            .string()
            .trim()
            .matches(/^[a-z ,.'-]+$/i)
            .min(3)
            .max(50)
            .required(),
        email: yup.string().trim().email().max(50).required(),
        password: yup.string().trim().min(8).max(50).required(),
        username: yup.string().trim().min(1).max(20).required(),
    });
    try {
        await validationSchema.validate(data, {
            abortEarly: false,
            strict: true,
        });
    } catch (err) {
        res.status(400).json({ errors: err.errors });
        return;
    }

    // Trim string values
    data.name = data.name.trim();
    data.email = data.email.trim().toLowerCase();
    data.password = data.password.trim();

    // Check email
    let user = await User.findOne({
        where: { email: data.email },
    });

    if (user) {
        res.status(400).json({ message: "Email already exists." });
        return;
    }

    // Hash passowrd
    data.password = await bcrypt.hash(data.password, 10);
    // Create user
    let result = await User.create(data);
    res.json(result);
});

router.post("/login", async (req, res) => {
    let data = req.body;
    // Validate request body
    let validationSchema = yup.object().shape({
        email: yup.string().trim().email().max(50).required(),
        password: yup.string().trim().min(8).max(50).required(),
    });
    try {
        await validationSchema.validate(data, {
            abortEarly: false,
            strict: true,
        });
    } catch (err) {
        res.status(400).json({ errors: err.errors });
        return;
    }

    // Trim string values
    data.email = data.email.trim().toLowerCase();
    data.password = data.password.trim();

    // Check email and password
    let errorMsg = "Email or password is not correct.";
    let user = await User.findOne({
        where: { email: data.email },
    });
    if (!user) {
        res.status(400).json({ message: errorMsg });
        return;
    }
    if (user.isBanned) {
        res.status(400).json({ message: "Account is banned." });
        return;
    }

    let match = await bcrypt.compare(data.password, user.password);
    if (!match) {
        res.status(400).json({ message: errorMsg });
        return;
    }

    // Return user info
    let userInfo = {
        id: user.id,
        email: user.email,
        name: user.name,
        username: user.username,
        password: user.password,
        imageFile: user.imageFile,
        isAdmin: user.isAdmin,
        isBanned: user.isBanned,
        rewardPoints: user.rewardPoints,
    };
    let accessToken = sign(userInfo, process.env.APP_SECRET);

    res.json({
        accessToken: accessToken,
        user: userInfo,
    });
});

router.get("/auth", validateToken, (req, res) => {
    let userInfo = {
        id: req.user.id,
        name: req.user.name,
        email: req.user.email,
        username: req.user.username,
        password: req.user.password,
        imageFile: req.user.imageFile,
        isAdmin: req.user.isAdmin,
        isBanned: req.user.isBanned,
        rewardPoints: req.user.rewardPoints,
    };

    res.json({
        user: userInfo,
    });
});

router.get("/getuser", validateToken, async (req, res) => {
    const user = await User.findByPk(req.user.id);

    if (!user) {
        res.sendStatus(404);
        return;
    }

    res.json({
        id: user.id,
        name: user.name,
        email: user.email,
        username: user.username,
        password: user.password,
        imageFile: user.imageFile,
        isAdmin: user.isAdmin,
        isBanned: user.isBanned,
        rewardPoints: user.rewardPoints,
    });
});

router.get("/admingetuser/:id", async (req, res) => {
    let id = req.params.id;
    const user = await User.findByPk(id, {paranoid: false});

    if (!user) {
        res.sendStatus(404);
        return;
    }

    res.json({
        name: user.name,
        email: user.email,
        username: user.username,
        password: user.password,
        imageFile: user.imageFile,
        isAdmin: user.isAdmin,
        isBanned: user.isBanned,
        rewardPoints: user.rewardPoints,
    });
});

router.delete("/:id", validateToken, async (req, res) => {
    let id = req.params.id;
    const user = await User.findByPk(id);

    if (!user) {
        res.sendStatus(404);
        return;
    }
    // Check request user id
    if (user.id !== req.user.id) {
        res.sendStatus(403);
        return;
    }

    let num = await User.destroy({
        where: { id: id },
    });
    if (num === 1) {
        res.json({
            message: "Account was deleted successfully.",
        });
    } else {
        res.status(400).json({
            message: `Cannot delete account with id ${id}.`,
        });
    }
});

router.delete("/admindelete/:id", async (req, res) => {
    const id = req.params.id;

    let user = await User.findByPk(id);
    if (!user) {
        res.sendStatus(404);
        return;
    }

    if (user.isBanned) {
        res.status(400).json({
            message: `Cannot delete a banned account with id ${id}.`,
        });
        return;
    }

    let num = await User.destroy({
        where: { id: id },
    });
    if (num === 1) {
        res.json({
            message: "Account was deleted successfully.",
        });
    } else {
        res.status(400).json({
            message: `Cannot delete account with id ${id}.`,
        });
    }
});

router.put("/update/:id", validateToken, async (req, res) => {
    let id = req.params.id;

    try {
        const user = await User.findByPk(id);
        if (!user) {
            return res.sendStatus(404);
        }
        if (user.id !== req.user.id) {
            return res.sendStatus(403);
        }

        let data = req.body;
        // Validate request body
        let validationSchema = yup.object().shape({
            name: yup.string().trim().min(1).max(50).required(),
            username: yup.string().trim().min(1).max(20).required(),
            email: yup.string().trim().email().max(50).required(),
        });

        // Check if the email is being changed
        if (data.email !== user.email) {
            try {
                await validationSchema.validate(data, { abortEarly: false });
            } catch (err) {
                console.error(err);
                return res.status(400).json({ errors: err.errors });
            }

            // Check email
            let existingUser = await User.findOne({
                where: { email: data.email },
            });
            if (existingUser && existingUser.id !== id) {
                return res
                    .status(409)
                    .json({ message: "Email already exists." });
            }
        }

        // Update user details
        user.name = data.name;
        user.username = data.username;
        user.email = data.email;
        user.imageFile = data.imageFile;

        await user.save();

        res.json({ message: "Account was updated successfully." });
    } catch (error) {
        console.error("Error updating user:", error);
        res.status(500).json({ message: "Error updating user" });
    }
});

router.put("/updatepassword/:id", validateToken, async (req, res) => {
    let id = req.params.id;

    try {
        const user = await User.findByPk(id);
        if (!user) {
            return res.sendStatus(404);
        }
        if (user.id !== req.user.id) {
            return res.sendStatus(403);
        }

        let data = req.body;
        // Validate request body
        let validationSchema = yup.object().shape({
            password: yup.string().trim().min(8).max(50).required(),
        });

        try {
            await validationSchema.validate(data, { abortEarly: false });
        } catch (err) {
            console.error(err);
            return res.status(400).json({ errors: err.errors });
        }

        user.password = data.password.trim();

        user.password = await bcrypt.hash(data.password, 10);

        await user.save();

        res.json({ message: "Password was updated successfully." });
    } catch (error) {
        console.error("Error updating user password:", error);
        res.status(500).json({ message: "Error updating password" });
    }
});

router.put("/adminupdate/:id", async (req, res) => {
    let id = req.params.id;

    const user = await User.findByPk(id);
    let data = req.body;

    try {
        // Check if user is banned
        if (user.isBanned) {
            return res
                .status(400)
                .json({ message: "Account is currently banned." });
        }

        // Validate request body
        let validationSchema = yup.object().shape({
            name: yup.string().trim().min(1).max(50).required(),
            username: yup.string().trim().min(1).max(20).required(),
            email: yup.string().trim().email().max(50).required(),
            isAdmin: yup.boolean().required(),
        });

        // Check if the email is being changed
        if (data.email !== user.email) {
            try {
                await validationSchema.validate(data, { abortEarly: false });
            } catch (err) {
                console.error(err);
                return res.status(400).json({ errors: err.errors });
            }

            // Check email
            let existingUser = await User.findOne({
                where: { email: data.email },
            });
            if (existingUser && existingUser.id !== id) {
                return res
                    .status(409)
                    .json({ message: "Email already exists." });
            }
        }

        // Update user details
        user.name = data.name;
        user.username = data.username;
        user.email = data.email;
        user.isAdmin = data.isAdmin;

        await user.save();

        res.json({ message: "Account was updated successfully." });
    } catch (error) {
        console.error("Error updating user:", error);
        res.status(500).json({ message: "Error updating user" });
    }
});

router.put("/ban/:id", async (req, res) => {
    let id = req.params.id;

    const user = await User.findByPk(id);

    try {
        if (user.isBanned) {
            return res
                .status(400)
                .json({ message: "Account is already banned." });
        }

        // Update user details
        user.isBanned = true;
        await user.save();

        res.json({ message: "Account was banned successfully." });
    } catch (error) {
        console.error("Error updating user:", error);
        res.status(500).json({ message: "Error banning user" });
    }
});

router.put("/unban/:id", async (req, res) => {
    let id = req.params.id;

    const user = await User.findByPk(id);

    try {
        if (!user.isBanned) {
            return res
                .status(400)
                .json({ message: "Account is not currently banned." });
        }

        // Update user details
        user.isBanned = false;
        await user.save();

        res.json({ message: "Account was unbanned successfully." });
    } catch (error) {
        console.error("Error updating user:", error);
        res.status(500).json({ message: "Error unbanning user" });
    }
});

router.get("/check-email/:email", async (req, res) => {
    try {
        const { email } = req.params;
        const user = await User.findOne({
            where: { email: email },
        });
        const doesExist = !!user;
        res.json({ doesExist: doesExist });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal server error" });
    }
});

router.get("/:id", async (req, res) => {
    const { id } = req.params;

    try {
        const user = await User.findByPk(id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Return the user details
        res.json({
            id: user.id,
            name: user.name,
            email: user.email,
            username: user.username,
        });
    } catch (error) {
        console.error("Error fetching user details:", error);
        res.status(500).json({ message: "Error fetching user details" });
    }
});

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
            where: condition,
            order: [["id", "DESC"]],
        });
        res.json(list);
    } catch (error) {
        console.error("Error fetching user list:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

module.exports = router;
