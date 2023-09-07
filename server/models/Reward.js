// Rewards Data Model

module.exports = (sequelize, DataTypes) => {
    const Reward = sequelize.define("Reward", {
        thumbnail: {
            type: DataTypes.STRING,
            allowNull: true,
        },

        rewardName: {
            type: DataTypes.STRING,
            allowNull: false,
        },

        pointRequirement: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },

        rewardDetails: {
            type: DataTypes.TEXT,
            allowNull: false,
        },

        expiryDate: {
            type: DataTypes.DATE,
            allowNull: true,
        },

        url: {
            type: DataTypes.STRING,
            allowNull: false,
        }
    },
    {
        paranoid: true,
    }
    );
    
    return Reward;
}