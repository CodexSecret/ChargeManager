// CouponUsages Data Model

module.exports = (sequelize, DataTypes) => {
    const CouponUsage = sequelize.define("CouponUsage", {
        userRedemption: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },

        couponCode: {
            type: DataTypes.STRING,
            allowNull: false,
        },
    },
    {
        paranoid: true,
    }
    );

    CouponUsage.associate = (models) => {
        // Associate with Coupon
        CouponUsage.belongsTo(models.Coupon, {
            foreignKey: "CouponId", // Assuming CouponId is the foreign key in CouponUsage
        });
    };

    
    return CouponUsage;
}