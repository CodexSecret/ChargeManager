const express = require("express");
const router = express.Router();
const { Address, User, Sequelize } = require("../models");
const yup = require("yup");
const { validateToken } = require("../middlewares/auth");

router.post("/", validateToken, async (req, res) => {
    let data = req.body;
    // Validate request body
    let validationSchema = yup.object().shape({
        addressLineOne: yup.string().trim().max(40).required(),
        addressLineTwo: yup.string().max(40),
        addressLineThree: yup.string().max(40),
        zipcode: yup.string().min(6).max(6).required(),
        city: yup.string().trim().min(1).max(50).required(),
        country: yup.string().trim().min(1).max(40).required(),
    });
    try {
        await validationSchema.validate(data, {
            abortEarly: false,
            strict: true,
        });
    } catch (err) {
        console.error(err);
        res.status(400).json({ errors: err.errors });
        return;
    }
    data.addressLineOne = data.addressLineOne.trim();
    if (data.addressLineTwo) {
        data.addressLineTwo = data.addressLineTwo.trim();
    }
    if (data.addressLineThree) {
        data.addressLineThree = data.addressLineThree.trim();
    }
    data.zipcode = data.zipcode.trim();
    data.city = data.city.trim();
    data.country = data.country.trim();
    data.userId = req.user.id;
    let result = await Address.create(data);
    res.json(result);
});

router.get("/", validateToken, async (req, res) => {
    let condition = {};
    let search = req.query.search;
    let user = req.user;

    if (search) {
        condition[Sequelize.Op.or] = [
            { addressLineOne: { [Sequelize.Op.like]: `%${search}%` } },
            { addressLineTwo: { [Sequelize.Op.like]: `%${search}%` } },
            { addressLineThree: { [Sequelize.Op.like]: `%${search}%` } },
            { zipcode: { [Sequelize.Op.like]: `%${search}%` } },
            { city: { [Sequelize.Op.like]: `%${search}%` } },
            { country: { [Sequelize.Op.like]: `%${search}%` } },
        ];
    }

    if (!user.isAdmin) {
        condition.userId = user.id;
    }
    let list = await Address.findAll({
        where: condition,
        order: [["createdAt", "DESC"]],
        include: { model: User, as: "user", attributes: ["name"] },
    });

    res.json(list);
});

router.get("/adminaddress", validateToken, async (req, res) => {
    let condition = {};
    let search = req.query.search;

    if (search) {
        condition[Sequelize.Op.or] = [
            { userId: { [Sequelize.Op.like]: `%${search}%` } },
            { addressLineOne: { [Sequelize.Op.like]: `%${search}%` } },
            { addressLineTwo: { [Sequelize.Op.like]: `%${search}%` } },
            { addressLineThree: { [Sequelize.Op.like]: `%${search}%` } },
            { zipcode: { [Sequelize.Op.like]: `%${search}%` } },
            { city: { [Sequelize.Op.like]: `%${search}%` } },
            { country: { [Sequelize.Op.like]: `%${search}%` } },
        ];
    }

    let list = await Address.findAll({
        where: condition,
        order: [["createdAt", "DESC"]],
        include: { model: User, as: "user", attributes: ["name"] },
    });

    res.json(list);
});

router.get("/:id", validateToken, async (req, res) => {
    let id = req.params.id;
    let address = await Address.findByPk(id);
    // Check id not found
    if (!address) {
        res.sendStatus(404);
        return;
    }
    res.json(address);
});

router.put("/:id", validateToken, async (req, res) => {
    let id = req.params.id;
    let data = req.body;

    let validationSchema = yup.object().shape({
        addressLineOne: yup.string().trim().max(40).required(),
        addressLineTwo: yup.string().max(40),
        addressLineThree: yup.string().max(40),
        zipcode: yup.string().min(6).max(6).required(),
        city: yup.string().trim().min(1).max(50).required(),
        country: yup.string().trim().min(1).max(40).required(),
    });
    try {
        await validationSchema.validate(data, {
            abortEarly: false,
            strict: true,
        });
    } catch (err) {
        console.error(err);
        res.status(400).json({ errors: err.errors });
        return;
    }
    // Check id not found
    let address = await Address.findByPk(id);
    if (!address) {
        res.sendStatus(404);
        return;
    }
    // Check request user id
    let userId = req.user.id;
    if (address.userId != userId) {
        res.sendStatus(403);
        return;
    }
    data.addressLineOne = data.addressLineOne.trim();
    if (data.addressLineTwo) {
        data.addressLineTwo = data.addressLineTwo.trim();
    }
    if (data.addressLineThree) {
        data.addressLineThree = data.addressLineThree.trim();
    }
    data.zipcode = data.zipcode.trim();
    data.city = data.city.trim();
    data.country = data.country.trim();

    let num = await Address.update(data, {
        where: { id: id },
    });
    if (num == 1) {
        res.json({
            message: "Address was updated successfully.",
        });
    } else {
        res.status(400).json({
            message: `Cannot update address with id ${id}.`,
        });
    }
});

router.delete("/:id", validateToken, async (req, res) => {
    let id = req.params.id;
    // Check id not found
    let address = await Address.findByPk(id);
    if (!address) {
        res.sendStatus(404);
        return;
    }
    let userId = req.user.id;
    if (address.userId != userId) {
        res.sendStatus(403);
        return;
    }

    let num = await Address.destroy({
        where: { id: id },
    });
    if (num == 1) {
        res.json({
            message: "Address was deleted successfully.",
        });
    } else {
        res.status(400).json({
            message: `Cannot delete address with id ${id}.`,
        });
    }
});

module.exports = router;
