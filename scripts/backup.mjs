const fs = require('fs');
const path = require('path');
const { Sequelize } = require('sequelize');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config({ path: '.env.local' });

async function backupMySQL() {
    console.log('Starting MySQL backup...');
    const sequelize = new Sequelize(
        process.env.MYSQL_DATABASE,
        process.env.MYSQL_USER,
        process.env.MYSQL_PASSWORD,
        {
            host: process.env.MYSQL_HOST,
            dialect: 'mysql',
            logging: false,
        }
    );

    try {
        const queryInterface = sequelize.getQueryInterface();
        const tables = await queryInterface.showAllTables();
        const backupData = {};

        for (const table of tables) {
            const [results] = await sequelize.query(`SELECT * FROM ${table}`);
            backupData[table] = results;
        }

        fs.writeFileSync(
            path.join(__dirname, '../backups/mysql_backup.json'),
            JSON.stringify(backupData, null, 2)
        );
        console.log('MySQL backup completed: backups/mysql_backup.json');
    } catch (error) {
        console.error('MySQL backup failed:', error);
    } finally {
        await sequelize.close();
    }
}

async function backupMongoDB() {
    console.log('Starting MongoDB backup...');
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const db = mongoose.connection.db;
        const collections = await db.listCollections().toArray();
        const backupData = {};

        for (const col of collections) {
            const data = await db.collection(col.name).find({}).toArray();
            backupData[col.name] = data;
        }

        fs.writeFileSync(
            path.join(__dirname, '../backups/mongodb_backup.json'),
            JSON.stringify(backupData, null, 2)
        );
        console.log('MongoDB backup completed: backups/mongodb_backup.json');
    } catch (error) {
        console.error('MongoDB backup failed:', error);
    } finally {
        await mongoose.disconnect();
    }
}

async function run() {
    if (!fs.existsSync(path.join(__dirname, '../backups'))) {
        fs.mkdirSync(path.join(__dirname, '../backups'));
    }
    await backupMySQL();
    await backupMongoDB();
}

run();
