module.exports = (sequelize, DataTypes) => {
    const Car = sequelize.define("Car", {
        license: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        carmodel: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        location: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        startdate: {
            type: DataTypes.DATEONLY,
            allowNull: false,
        },
        enddate: {
            type: DataTypes.DATEONLY,
            allowNull: false,
        },
        price: {
            type: DataTypes.DECIMAL(8, 2),
            allowNull: false,
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        imageFile: {
            type: DataTypes.STRING,
        },
    });

    Car.associate = (models) => {
        Car.belongsTo(models.User, {
            foreignKey: "userId",
            as: "user",
        });
        Car.hasMany(models.Review, {
            foreignKey: "carId",
            onDelete: "cascade",
        });
        Car.hasMany(models.Chat, {
            foreignKey: "carId",
            onDelete: "cascade",
        });
        Car.belongsTo(models.Branch, {
            foreignKey: "branchId",
            as: "branch",
        });
        Car.hasMany(models.Booking, {
            foreignKey: "carId",
            onDelete: "cascade",
        });
        Car.hasMany(models.Booking, {
            foreignKey: 'carId',
            onDelete: "cascade"
        });
    };

    return Car;
};
