const express = require('express');
const router = express.Router();
const { User, Chat, Car, Message, Sequelize } = require('../models');
const { validateToken } = require('../middlewares/auth');

router.post("/:id", validateToken, async (req, res) => {
    let data = req.body;
    let id = req.params.id;
    data.userId = req.user.id;
    data.carId = id
    data.pinned = false
    data.delete = false
    let result = await Chat.create(data);
    res.json(result);
});

router.get("/", validateToken, async (req, res) => {
    let condition = {};
    let search = req.query.search;
    let user = req.user.id;
    if (search) {
        realsearch = []
        realsearch2 = []
        realsearch3 = []
        let list1 = await Car.findAll({
            order: [['createdAt', 'DESC']],
        });
        let list2 = await User.findAll({
            order: [['createdAt', 'DESC']],
        });
        let list3 = await Chat.findAll({
            order: [['createdAt', 'DESC']],
        });
        let list4 = await Message.findAll({
            order: [['createdAt', 'DESC']],
        });
        for (j in list1) {
            if (list1[j]['dataValues']['carmodel'].toUpperCase().includes(search.toUpperCase())) {
                realsearch.push(list1[j]['dataValues']['id'])
            }
            for (m in list3) {
                if (list3[m]['dataValues']['carId'] == list1[j]['dataValues']['id']) {
                    for (k in list2) {
                        if (list2[k]['dataValues']['username'].toUpperCase().includes(search.toUpperCase())) {
                            if (user == list3[m]['dataValues']['userId']) {
                                if (list2[k]['dataValues']['id'] == list1[j]['dataValues']['userId']) {
                                    realsearch.push(list1[j]['dataValues']['id'])
                                }
                            }
                            else if (user == list1[j]['dataValues']['userId']) {
                                if (list2[k]['dataValues']['id'] == list3[m]['dataValues']['userId']) {
                                    realsearch2.push(list3[m]['dataValues']['userId'])
                                }
                            }

                        }
                    }
                }
            }
        }
        for (j in list3){
            for(m in list4){
                if(list4[m]['dataValues']['chatId'] == list3[j]['dataValues']['id']){
                    if (list4[m]['dataValues']['text'].toUpperCase().includes(search.toUpperCase())){
                        realsearch3.push(list3[j]['dataValues']['id'])
                    }
                }
            }
        }
        condition[Sequelize.Op.or] = [
            { carId: { [Sequelize.Op.in]: realsearch } },
            { userId: { [Sequelize.Op.in]: realsearch2 } },
            { id: { [Sequelize.Op.in]: realsearch3 } }
        ];
    }
    let list = await Chat.findAll({
        where: condition,
        order: [['createdAt', 'DESC']],
        include: { model: Car, as: "car", attributes: ['carmodel', 'userId'] }
    });
    res.json(list);
});

router.get("/:id", async (req, res) => {
    let id = req.params.id;
    let chat = await Chat.findByPk(id, {
        include: { model: Car, as: "car", attributes: ['carmodel', 'userId'] }
    });
    // Check id not found
    if (!chat) {
        res.sendStatus(404);
        return;
    }
    res.json(chat);
});

router.put("/:id", validateToken, async (req, res) => {
    let id = req.params.id;
    // Check id not found
    let chat = await Chat.findByPk(id);
    if (!chat) {
        res.sendStatus(404);
        return;
    }

    data = req.body;
    data.userId = data.userId;
    data.carId = data.carId;
    data.pinned = data.pinned;
    data.userPinned1 = data.userPinned1;
    data.userPinned2 = data.userPinned2;
    data.delete = data.delete;
    data.userDelete1 = data.userDelete1;
    data.userDelete2 = data.userDelete2;
    let num = await Chat.update(data, {// peform update using sequelise
        where: { id: id }// where conding to check for the SQL
    });
    if (num == 1) {// when data is updated
        res.json({
            message: "Chat was updated successfully."
        });
    }
    else {
        res.status(400).json({
            message: `Cannot update Chat with id ${id}.`
        });
    }
});

router.delete("/:id", validateToken, async (req, res) => {
    let id = req.params.id;
    // Check id not found
    let chat = await Chat.findByPk(id);
    if (!chat) {
        res.sendStatus(404);
        return;
    }


    let num = await Chat.destroy({
        where: { id: id }
    })
    if (num == 1) {
        res.json({
            message: "Chat was deleted successfully."
        });
    }
    else {
        res.status(400).json({
            message: `Cannot delete chat with id ${id}.`
        });
    }
});

module.exports = router;