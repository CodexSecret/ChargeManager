module.exports = (sequelize, DataTypes) => {
  const Booking = sequelize.define("Booking", {

    bookingId: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
    },
    startDate: {
      type: DataTypes.DATE,
      allowNull: false
    },
    endDate: {
      type: DataTypes.DATE,
      allowNull: false
    },
    totalCost: {
      type: DataTypes.DECIMAL(8, 2),
      allowNull: true 
    },
    childBooster: {
      type: DataTypes.BOOLEAN,
      allowNull: true
    },
    insurance: {
      type: DataTypes.BOOLEAN,
      allowNull: true
    },
    noExtras: {
      type: DataTypes.BOOLEAN,
      allowNull: true
    },
    paymentName: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    paymentNumber: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    paymentCVV: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    expiryDate: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    isDeleted: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    licenseNew: {
      type: DataTypes.STRING,
      allowNull: false
    },
    carModelNew: {
      type: DataTypes.STRING,
      allowNull: false
    },
    locationNew: {
      type: DataTypes.STRING,
      allowNull: false
    },
    imageFileNew: {
      type: DataTypes.STRING
    },
    userEmail: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    userName: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    handlePoints: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    handleCode: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    }

  });
  Booking.associate = (models) => {
    Booking.belongsTo(models.User, {
      foreignKey: "userId",
      as: 'user'
    });
    Booking.belongsTo(models.Car, {
      foreignKey: "carId",
      as: 'car'
    });
    Booking.belongsTo(models.Coupon, { 
      foreignKey: 'couponId', 
      as: 'coupon' 
    });
  };

    return Booking;
}
