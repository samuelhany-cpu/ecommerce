import { DataTypes } from 'sequelize';
import sequelize from '@/lib/mysql';
import User from './User';

const Order = sequelize.define('Order', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: User,
            key: 'id',
        },
    },
    totalAmount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
    },
    status: {
        type: DataTypes.ENUM('pending', 'paid', 'shipped', 'cancelled'),
        defaultValue: 'pending',
    },
    items: {
        type: DataTypes.JSON, // Storing product details/IDs as JSON for simplicity in hybrid MySQL/Mongo setup
        allowNull: false,
    },
}, {
    timestamps: true,
});

// Define association
User.hasMany(Order, { foreignKey: 'userId' });
Order.belongsTo(User, { foreignKey: 'userId' });

export default Order;
