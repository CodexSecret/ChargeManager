const express = require('express');
const router = express.Router();
const { User, Review, Sequelize } = require('../models');
const { validateToken } = require('../middlewares/auth');
const yup = require("yup");

router.post("/:id", validateToken, async (req, res) => {
    let data = req.body;
    let id = req.params.id;
    // Validate request body
    let validationSchema = yup.object().shape({
        description: yup.string().trim().min(3).max(500).required()
    });
    try {
        await validationSchema.validate(data, { abortEarly: false });
    }
    catch (err) {
        console.error(err);
        res.status(400).json({ errors: err.errors });
        return;
    }
    data.rating = data.rating
    data.description = data.description.trim();
    data.userId = req.user.id;
    data.carId = id
    let result = await Review.create(data);
    res.json(result);
});

router.get("/", async (req, res) => {
    let sort = req.query.sort;
    let order = ['createdAt', 'DESC']
    if (typeof(sort) != "undefined"){
        order = sort.split(',')
    }
    let list = await Review.findAll({
        order: [order],
        include: { model: User, as: "user", attributes: ['username', 'imageFile'] }
    });
    res.json(list);
});

router.get("/:id", async (req, res) => {
    let id = req.params.id;
    let review = await Review.findByPk(id, {
        include: { model: User, as: "user", attributes: ['username', 'imageFile'] }
    });
    // Check id not found
    if (!review) {
        res.sendStatus(404);
        return;
    }
    res.json(review);
});

router.put("/:id", validateToken, async (req, res) => {
    let id = req.params.id;
    // Check id not found
    let review = await Review.findByPk(id);
    if (!review) {
        res.sendStatus(404);
        return;
    }

    // Check request user id
    let userId = req.user.id;
    if (review.userId != userId) {
        res.sendStatus(403);
        return;
    }

    let data = req.body;
    // Validate request body
    let validationSchema = yup.object().shape({// Validation schema to define what you want to validate
        rating: yup.string().trim().min(0).max(5),
        description: yup.string().trim().min(3).max(500)
    });
    try {
        await validationSchema.validate(data, { abortEarly: false });// performing validation
    }
    catch (err) {
        console.error(err);
        res.status(400).json({ errors: err.errors });// return 400 and a console of error
        return;
    }

    let num = await Review.update(data, {// peform update using sequelise
        where: { id: id }// where conding to check for the SQL
    });
    if (num == 1) {// when data is updated
        res.json({
            message: "Review was updated successfully."
        });
    }
    else {
        res.status(400).json({
            message: `Cannot update Review with id ${id}.`
        });
    }
});

router.delete("/:id", validateToken, async (req, res) => {
    let id = req.params.id;
    // Check id not found
    let review = await Review.findByPk(id);
    if (!review) {
        res.sendStatus(404);
        return;
    }

    let num = await Review.destroy({
        where: { id: id }
    })
    if (num == 1) {
        res.json({
            message: "Review was deleted successfully."
        });
    }
    else {
        res.status(400).json({
            message: `Cannot delete review with id ${id}.`
        });
    }
});

module.exports = router;