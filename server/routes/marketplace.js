const express = require('express');
const router = express.Router();
const { User, Car, Sequelize } = require('../models');
const yup = require("yup");
// const { validateToken } = require('../middlewares/auth');

router.get("/", async (req, res) => {
    let condition = {};
    let search = req.query.search;
    
    if (search) {
        condition[Sequelize.Op.or] = [
            { license: { [Sequelize.Op.like]: `%${search}%` } },
            { carmodel: { [Sequelize.Op.like]: `%${search}%` } },
            { location: { [Sequelize.Op.like]: `%${search}%` } },
            { startdate: { [Sequelize.Op.like]: `%${search}%` } },
            { enddate: { [Sequelize.Op.like]: `%${search}%` } },
            { price: { [Sequelize.Op.like]: `%${search}%` } },
            { description: { [Sequelize.Op.like]: `%${search}%` } }
        ];
    }

    // Add a condition to filter out expired cars
    condition.enddate = { [Sequelize.Op.gte]: new Date() };

    let list = await Car.findAll({
        where: condition,
        order: [['createdAt', 'DESC']],
        include: { model: User, as: "user", attributes: ['name','username','imageFile'] }
    });
    res.json(list);
});

router.get("/:id", async (req, res) => {
    let id = req.params.id;
    let car = await Car.findByPk(id);
    // Check id not found 
    if (!car) {
        res.sendStatus(404);
        return;
    }
    res.json(car);
});

module.exports = router;