// Coupon Data Model

module.exports = (sequelize, DataTypes) => {
    const Coupon = sequelize.define("Coupon", {
        discount: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },

        couponCode: {
            type: DataTypes.STRING,
            allowNull: false,
        },

        couponDetails: {
            type: DataTypes.TEXT,
            allowNull: false,
        },

        redemptionCount: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },

        expiryDate: {
            type: DataTypes.DATE,
            allowNull: true,
        }
    },
        {
            paranoid: true,
        }
    );

    Coupon.associate = (models) => {
        Coupon.belongsToMany(models.User, {
            through: "CouponUsage",
        });
        Coupon.hasMany(models.Booking, { 
            foreignKey: 'couponId', 
            as: 'bookings' 
        });
    };

    return Coupon;
}