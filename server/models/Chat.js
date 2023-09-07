module.exports = (sequelize, DataTypes) => {
    const Chat = sequelize.define("Chat", {
        pinned: {
            type: DataTypes.BOOLEAN,
            allowNull: true
        },
        userPinned1: {
            type: DataTypes.STRING,
            allowNull: true
        },
        userPinned2:{
            type: DataTypes.STRING,
            allowNull: true
        },
        delete: {
            type: DataTypes.BOOLEAN,
            allowNull: true
        },
        userDelete1: {
            type: DataTypes.STRING,
            allowNull: true
        },
        userDelete2:{
            type: DataTypes.STRING,
            allowNull: true
        }
    });

    Chat.associate = (models) => {
        Chat.hasMany(models.Message, {
            foreignKey: "chatId",
            onDelete: "cascade"
        });
        Chat.belongsTo(models.User, {
            foreignKey: "userId",
            as: 'user'
        });
        Chat.belongsTo(models.Car, {
            foreignKey: "carId",
            as: 'car'
        });
    };
    
    return Chat
};