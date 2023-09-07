module.exports = (sequelize, DataTypes) => {
    const Branch = sequelize.define("Branch", {
        nickname: {
            type: DataTypes.STRING,
            allowNull: false
        },
        address: {
            type: DataTypes.TEXT,
            allowNull: false
        }
    });
    Branch.associate = (models) => { 
        Branch.belongsTo(models.User, { 
            foreignKey: "userId", 
            as: 'user' 
        }); 
        Branch.hasMany(models.Car, {
            foreignKey: 'branchId',
            as: 'cars',
            onDelete: 'CASCADE'
        });
    };
    return Branch;
}