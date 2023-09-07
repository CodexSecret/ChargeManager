const express = require('express');
const router = express.Router();
const { validateToken } = require("../middlewares/auth");

// Sequelize
const { CouponUsage, Coupon, Sequelize, sequelize } = require('../models');

// Yup Validation
const yup = require("yup");

// Post function for adding coupons to the list
router.post("/", async (req, res) => {
    let data = req.body;
    data.expiryDate = new Date(data.expiryDate);

    // Yup Validation
    let validationSchema = yup.object().shape({ 
        discount: yup.number().min(1).max(100).required().integer(), 
        couponCode: yup.string().trim().min(3).max(20).required(),
        couponDetails: yup.string().trim().min(1).max(1500).required(),
        redemptionCount: yup.number().min(0).max(10).required().integer(),
        expiryDate: yup.date().min(new Date()),
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

    let result = await Coupon.create(data);
    res.json(result);
});

// Get function for retrieving coupons from the list
router.get("/", async (req, res) => {
    let condition = {};
    let search = req.query.search;
    if (search) {
        condition[Sequelize.Op.or] = [
            { discount: { [Sequelize.Op.like]: `%${search}%` } },
            { couponCode: { [Sequelize.Op.like]: `%${search}%` } },
        ];
    }

    let list = await Coupon.findAll({
        where: condition,
        order: [['createdAt', 'DESC']]
    });
    res.json(list)
})

// Get function for retrieving all (including expired) coupons from the list
router.get("/all", async (req, res) => {
    let condition = {};
    let search = req.query.search;
    if (search) {
        condition[Sequelize.Op.or] = [
            { discount: { [Sequelize.Op.like]: `${search}` } },
            { couponCode: { [Sequelize.Op.like]: `${search}` } },
        ];
    }

    let list = await Coupon.findAll({
        where: condition,
        order: [['createdAt', 'DESC']],
        paranoid: false                                                                                                                 // NEW ITEM ADDED 1008H 12/8
    });
    res.json(list)
})

// Get coupon by ID function
router.get("/:id", async (req, res) => { 
    let id = req.params.id; 
    let coupon = await Coupon.findByPk(id);

    // Check id not found 
    if (!coupon) { 
        res.sendStatus(404); 
        return; 
    }

    res.json(coupon); 
});

// Update coupon function
router.put("/:id", async (req, res) => { 
    let id = req.params.id;
    
    // Check id not found 
    let coupon = await Coupon.findByPk(id);

    if (!coupon) { 
        res.sendStatus(404); 
        return; 
    }

    let data = req.body; 
    data.expiryDate = new Date(data.expiryDate);

    // Yup Validation
    let validationSchema = yup.object().shape({ 
        discount: yup.number().min(1).max(100).required().integer(), 
        couponCode: yup.string().trim().min(3).max(20).required(),
        couponDetails: yup.string().trim().min(1).max(1500).required(),
        redemptionCount: yup.number().min(0).max(10).required().integer(), 
        expiryDate: yup.date().min(new Date()),
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

    let num = await Coupon.update(data, { 
        where: { id: id } 
    }); 

    if (num == 1) { 
        res.json({ 
            message: "Coupon was updated successfully." 
        }); 
    } 

    else { 
        res.status(400).json({ 
            message: `Cannot update coupon with id ${id}.` 
        }); 
    } 
});

// Delete coupon function
router.delete("/:id", async (req, res) => { 
    let id = req.params.id; 
    let num = await Coupon.destroy({ 
        where: { id: id } 
    }) 

    if (num == 1) { 
        res.json({ 
            message: "Coupon was deleted successfully." 
        }); 
    } 

    else { 
        res.status(400).json({ 
            message: `Cannot delete coupon with id ${id}.` 
        }); 
    } 
});

module.exports = router;