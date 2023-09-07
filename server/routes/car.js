const express = require('express');
const router = express.Router();
const { User, Car, Sequelize, Branch } = require('../models');
const yup = require("yup");
const { validateToken } = require('../middlewares/auth');

router.post("/", validateToken, async (req, res) => {
    let data = req.body;
    data.startdate = new Date(data.startdate);
    data.enddate = new Date(data.enddate);
    // Validate request body 
    let validationSchema = yup.object().shape({
        license: yup.string().trim().length(8).required(),
        carmodel: yup.string().trim().min(3).max(100).required(),
        location: yup.string().trim().min(3).max(100).required(),
        startdate: yup
            .date()
            .min(new Date(), 'Start date must be after the current date')
            .required(),
        enddate: yup
            .date()
            .min(yup.ref('startdate'), 'End date must be after the start date')
            .required(),
        price: yup.number().min(0.01).max(9999.99).required(),
        description: yup.string().trim().min(3).max(500).required()
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

    const location = data.location.trim();
    const branch = await Branch.findOne({ where: { nickname: location } });

    if (!branch) {
        res.status(400).json({ message: "No branch found for the given location." });
        return;
    }

    data.license = data.license.trim();
    data.carmodel = data.carmodel.trim();
    data.location = data.location.trim();
    data.description = data.description.trim();
    data.branchId = branch.id;
    data.userId = req.user.id;
    let result = await Car.create(data);
    res.json(result);
});

router.put("/:id", validateToken, async (req, res) => {
    let id = req.params.id;
    let dataupdate = req.body;
    dataupdate.startdate = new Date(dataupdate.startdate);
    dataupdate.enddate = new Date(dataupdate.enddate);
    // Validate request body 
    let validationSchema = yup.object().shape({
        license: yup.string().trim().length(8).required(),
        carmodel: yup.string().trim().min(3).max(100).required(),
        location: yup.string().trim().min(3).max(100).required(),
        startdate: yup
            .date()
            .min(new Date(), 'Start date must be after the current date')
            .required(),
        enddate: yup
            .date()
            .min(yup.ref('startdate'), 'End date must be after the start date')
            .required(),
        price: yup.number().min(0.01).max(9999.99).required(),
        description: yup.string().trim().min(3).max(500).required()
    });
    try {
        await validationSchema.validate(dataupdate, { abortEarly: false, strict: true });
    }
    catch (err) {
        console.error(err);
        res.status(400).json({ errors: err.errors });
        return;
    }
    // Check id not found 
    let car = await Car.findByPk(id);
    if (!car) {
        res.sendStatus(404);
        return;
    }
    // Check request user id 
    let userId = req.user.id;
    if (car.userId != userId) {
        res.sendStatus(403);
        return;
    }
    dataupdate.license = dataupdate.license.trim();
    dataupdate.carmodel = dataupdate.carmodel.trim();
    dataupdate.location = dataupdate.location.trim();
    dataupdate.description = dataupdate.description.trim();
    let num = await Car.update(dataupdate, {
        where: { id: id }
    });
    if (num == 1) {
        res.json({
            message: "Car was updated successfully."
        });
    } else {
        res.status(400).json({
            message: `Cannot update car with id ${id}.`
        });
    }
});

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

    let list = await Car.findAll({
        where: condition,
        order: [['createdAt', 'DESC']],
        include: { model: User, as: "user", attributes: ['name'] }
    });

    res.json(list);
});

router.get("/:id", validateToken, async (req, res) => {
    let id = req.params.id;
    let car = await Car.findByPk(id);
    // Check id not found 
    if (!car) {
        res.sendStatus(404);
        return;
    }
    res.json(car);
});

router.delete("/:id", validateToken, async (req, res) => {
    let id = req.params.id;
    // Check id not found
    let car = await Car.findByPk(id);
    if (!car) {
        res.sendStatus(404);
        return;
    }

    // Check request user id
    let userId = req.user.id;
    if (car.userId != userId) {
        res.sendStatus(403);
        return;
    }

    let num = await Car.destroy({
        where: { id: id }
    })
    if (num == 1) {
        res.json({
            message: "Car was deleted successfully."
        });
    }
    else {
        res.status(400).json({
            message: `Cannot delete car with id ${id}.`
        });
    }
});

module.exports = router;