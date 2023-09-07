module.exports = (sequelize, DataTypes) => {
    const Review = sequelize.define("Review", {
        rating: {
            type: DataTypes.DECIMAL(2,1),
            allowNull: false,
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
    });

    Review.associate = (models) => {
        Review.hasMany(models.ReportReview, {
            foreignKey: "reviewId",
            onDelete: "cascade"
        });
        Review.belongsTo(models.User, {
            foreignKey: "userId",
            as: 'user'
        });
        Review.belongsTo(models.Car, {
            foreignKey: "carId",
            as: 'car'
        });
    };
    return Review
};
