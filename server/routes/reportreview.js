const express = require('express');
const router = express.Router();
const { ReportReview, Review, Car, Sequelize } = require('../models');
const { validateToken } = require('../middlewares/auth');
const yup = require("yup");

router.post("/:id", validateToken, async (req, res) => {
    let data = req.body;
    let reviewId = req.params.id;
    // Validate request body
    let validationSchema = yup.object().shape({
        description: yup.string().trim().max(150)
    });
    try {
        await validationSchema.validate(data, { abortEarly: false });
    }
    catch (err) {
        console.error(err);
        res.status(400).json({ errors: err.errors });
        return;
    }
    data.title = data.title;
    data.description = data.description.trim();
    data.reviewId = reviewId;
    let result = await ReportReview.create(data);
    res.json(result);
});

router.get("/", async (req, res) => {
    let condition = {};
    let search = req.query.search;
    if (search) {
        realsearch = []
        let list1 = await ReportReview.findAll({
            order: [['createdAt', 'DESC']],
        });
        let list2 = await Review.findAll({
            order: [['createdAt', 'DESC']],
        });
        let list3 = await Car.findAll({
            order: [['createdAt', 'DESC']],
        });
        for (j in list1) {
            for (l in list2) {
                if (list1[j]['dataValues']['reviewId'] == list2[l]['dataValues']['id']) {
                    if (list2[l]['dataValues']['description'].toUpperCase().includes(search.toUpperCase())) {
                        realsearch.push(list1[j]['dataValues']['id'])
                    }
                }
                for (m in list3){
                    if (list3[m]['dataValues']['id'] == list2[l]['dataValues']['carId']){
                        if (list3[m]['dataValues']['carmodel'].toUpperCase().includes(search.toUpperCase())) {
                            realsearch.push(list1[j]['dataValues']['id'])
                        }
                    }
                }
            }
            for(n in list1[j]['dataValues']['title']){
                if(list1[j]['dataValues']['title'][n].toUpperCase().includes(search.toUpperCase())){
                    realsearch.push(list1[j]['dataValues']['id'])
                }
            }
            if (list1[j]['dataValues']['description'].toUpperCase().includes(search.toUpperCase())) {
                realsearch.push(list1[j]['dataValues']['id'])
            }
        }
        condition[Sequelize.Op.or] = [
            { id: { [Sequelize.Op.in]: realsearch } }
        ];
    }
    let list = await ReportReview.findAll({
        where: condition,
        order: [['createdAt', 'DESC']],
    });
    res.json(list);
});

router.get("/:id", async (req, res) => {
    let id = req.params.id;
    let reportreview = await ReportReview.findByPk(id, {
    });
    // Check id not found
    if (!reportreview) {
        res.sendStatus(404);
        return;
    }
    res.json(reportreview);
});

router.delete("/:id", async (req, res) => {
    let id = req.params.id;
    // Check id not found
    let reportreview = await ReportReview.findByPk(id);
    if (!reportreview) {
        res.sendStatus(404);
        return;
    }

    let num = await ReportReview.destroy({
        where: { id: id }
    })
    if (num == 1) {
        res.json({
            message: "Review report was deleted successfully."
        });
    }
    else {
        res.status(400).json({
            message: `Cannot delete review report with id ${id}.`
        });
    }
});

module.exports = router;