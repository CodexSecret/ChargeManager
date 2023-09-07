const express = require("express");
const router = express.Router();
const {User, Coupon, CouponUsage, Sequelize } = require("../models");
const yup = require("yup");
const moment = require("moment");

router.post("/", async (req, res) => {
    let data = req.body;
    console.log(req.body);

    // Validate request body
    let validationSchema = yup.object().shape({
        userRedemption: yup.number().min(0).max(10).required().integer(),
        couponCode: yup.string().trim().min(3).max(20).required(),
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

    data.couponCode = data.couponCode.trim();
    let result = await CouponUsage.create(data);
    res.json(result);
});

router.get("/", async (req, res) => {
    let condition = {};
    let search = req.query.search;
    if (search) {
        condition[Sequelize.Op.or] = [
            { CouponId: { [Sequelize.Op.like]: `%${search}%` } },
            { UserId: { [Sequelize.Op.like]: `%${search}%` } },
        ];
    }

    let list = await CouponUsage.findAll({
        order: [["createdAt", "DESC"]],
    });
    res.json(list);
});

router.put("/", async (req, res) => {
    const { couponId, userId } = req.body;
    try {
        const coupon = await Coupon.findByPk(couponId);
    if (!coupon) {
          return res.status(404).send({ error: "Coupon not found" });
        }
    const couponCode = coupon.couponCode;
        let couponUsage = await CouponUsage.findOne({ where: { couponCode, UserId: userId } });
    if (!couponUsage) {
          await CouponUsage.create({
            couponCode,
            CouponId: couponId,
            UserId: userId,
            userRedemption: 1
          });
        } else {
          couponUsage.userRedemption += 1;
          await couponUsage.save();
        }
    
        res.send({ success: true });
      } catch (error) {
        console.error(error);
        res.status(500).json({ message: "An error occurred while updating coupon usage." });
      }
    });


module.exports = router;
