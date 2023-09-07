module.exports = (sequelize, DataTypes) => {
    const Message = sequelize.define("Message", {
        text: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        imageFile: {
            type: DataTypes.STRING
        },
        edited: {
            type: DataTypes.BOOLEAN,
        }
    });

    Message.associate = (models) => {
        Message.belongsTo(models.Chat, {
            foreignKey: "chatId",
            as: 'chat'
        });
        Message.belongsTo(models.User,{
            foreignkey: "userId",
            as: 'user'
        });
    };

    return Message
};