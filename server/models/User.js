const { v4: uuidv4 } = require("uuid");

module.exports = (sequelize, DataTypes) => {
    const User = sequelize.define(
        "User",
        {
            id: {
                type: DataTypes.STRING(8),
                primaryKey: true,
                defaultValue: () => uuidv4().slice(0, 8).toUpperCase(),
                allowNull: false,
            },
            email: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            password: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            name: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            username: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            imageFile: {
                type: DataTypes.STRING,
            },
            rewardPoints: {
                type: DataTypes.INTEGER,
                defaultValue: 0,
            },
            isAdmin: {
                type: DataTypes.BOOLEAN,
                defaultValue: false,
            },
            isBanned: {
                type: DataTypes.BOOLEAN,
                defaultValue: false,
            },
        },
        {
            paranoid: true,
        }
    );

    User.associate = (models) => {
        User.hasMany(models.Car, {
            foreignKey: "userId",
            onDelete: "cascade",
        });
        User.hasMany(models.Review, {
            foreignKey: "userId",
            onDelete: "cascade",
        });
        User.hasMany(models.Chat, {
            foreignKey: "userId",
            onDelete: "cascade",
        });
        User.hasMany(models.Message, {
            foreignKey: "userId",
            onDelete: "cascade",
        });
        User.belongsToMany(models.Coupon, {
            through: "CouponUsage",
        });
        User.hasMany(models.Address, {
            foreignKey: "userId",
            onDelete: "cascade",
        });
        User.hasMany(models.Booking, {
            foreignKey: "userId",
            onDelete: "cascade",
        });
    };

    return User;
};
