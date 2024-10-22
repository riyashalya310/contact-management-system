const { Sequelize } = require('sequelize');

// Initialize Sequelize
const sequelize = new Sequelize('your_database', 'your_username', 'your_password', {
  host: 'localhost',
  dialect: 'postgres', // Use 'mysql' if you're using MySQL
  logging: console.log, // Enable logging of all SQL queries
});

module.exports = sequelize; // Export the sequelize instance
