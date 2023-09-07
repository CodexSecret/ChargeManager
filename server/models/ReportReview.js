module.exports = (sequelize, DataTypes) => {
    const ReportReview = sequelize.define("ReportReview", { 
        title: {
            type: DataTypes.JSON,
            allowNull: false
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
    });

    return ReportReview
};