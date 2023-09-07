const express = require('express');
const router = express.Router();

// Sequelize
const { Reward, Sequelize } = require('../models');

// Yup Validation
const yup = require("yup");

// Post function for adding Rewards to the list
router.post("/", async (req, res) => {
    let data = req.body;
    data.expiryDate = new Date(data.expiryDate);

    // Yup Validation
    let validationSchema = yup.object().shape({ 
        rewardName: yup.string().trim().min(1).max(50).required(),
        pointRequirement: yup.number().min(1).max(100000).required().integer(),
        rewardDetails: yup.string().trim().min(1).max(3000).required(),
        expiryDate: yup.date().min(new Date()),
        url: yup.string().trim(),
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
    
    let result = await Reward.create(data)
    res.json(result);
});

// Get function for retrieving Rewards from the list
router.get("/", async (req, res) => {
    let condition = {};
    let search = req.query.search;
    if (search) {
        condition[Sequelize.Op.or] = [
            // { thumbnailFilename: { [Sequelize.Op.like]: `%${search}%` } },
            { rewardName: { [Sequelize.Op.like]: `%${search}%` } },
            { pointRequirement: { [Sequelize.Op.like]: `%${search}%` } },
            // { rewardDetails: { [Sequelize.Op.like]: `%${search}%` } },
            { expiryDate: { [Sequelize.Op.like]: `%${search}%` } },
        ];
    }

    let list = await Reward.findAll({
        where: condition,
        order: [['createdAt', 'DESC']]
    });
    res.json(list)
})

// Get reward by ID function
router.get("/:id", async (req, res) => { 
    let id = req.params.id; 
    let reward = await Reward.findByPk(id);

    // Check id not found 
    if (!reward) { 
        res.sendStatus(404); 
        return; 
    }

    res.json(reward); 
});

// Update reward function
router.put("/:id", async (req, res) => { 
    let id = req.params.id;

    // Check id not found 
    let reward = await Reward.findByPk(id); 

    if (!reward) { 
        res.sendStatus(404); 
        return; 
    }

    let data = req.body;
    data.expiryDate = new Date(data.expiryDate);

    // Yup Validation
    let validationSchema = yup.object().shape({ 
        // thumbnailFilename: yup.string().trim().required(),
        rewardName: yup.string().trim().min(1).max(50).required(),
        pointRequirement: yup.number().min(1).max(100000).required().integer(),
        rewardDetails: yup.string().trim().min(1).max(3000).required(),
        expiryDate: yup.date().min(new Date()),
        url: yup.string().trim(),
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

    let num = await Reward.update(data, { 
        where: { id: id } 
    }); 

    if (num == 1) { 
        res.json({ 
            message: "Reward was updated successfully." 
        }); 
    } 

    else { 
        res.status(400).json({ 
            message: `Cannot update reward with id ${id}.` 
        }); 
    } 
});

// Delete reward function
router.delete("/:id", async (req, res) => { 
    let id = req.params.id; 
    let num = await Reward.destroy({ 
        where: { id: id } 
    }) 

    if (num == 1) { 
        res.json({ 
            message: "Reward was deleted successfully." 
        }); 
    } 
    
    else { 
        res.status(400).json({ 
            message: `Cannot delete reward with id ${id}.` 
        }); 
    } 
});

module.exports = router;