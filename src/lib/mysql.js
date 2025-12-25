import { Sequelize } from 'sequelize';
import mysql2 from 'mysql2';

const sequelize = new Sequelize(
    process.env.MYSQL_DATABASE,
    process.env.MYSQL_USER,
    process.env.MYSQL_PASSWORD,
    {
        host: process.env.MYSQL_HOST,
        dialect: 'mysql', // or 'mysql2'
        dialectModule: mysql2,
        logging: false, // set to console.log to see the raw SQL queries
    }
);

export default sequelize;
