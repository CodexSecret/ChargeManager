const { v4: uuidv4 } = require("uuid");

module.exports = (sequelize, DataTypes) => {
    const Address = sequelize.define(
        "Address",
        {
            id: {
                type: DataTypes.STRING(8),
                primaryKey: true,
                defaultValue: () => uuidv4().slice(0, 8).toUpperCase(),
                allowNull: false,
            },
            addressLineOne: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            addressLineTwo: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            addressLineThree: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            zipcode: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            city: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            country: {
                type: DataTypes.STRING,
                allowNull: false,
            },
        },
        {
            paranoid: true,
        }
    );

    Address.associate = (models) => {
        Address.belongsTo(models.User, {
            foreignKey: "userId",
            as: "user",
        });
    };

    return Address;
};
