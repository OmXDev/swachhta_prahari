const mongoose = require("mongoose");
const logger = require("./winston");

const connectDB = async () => {
  const uri = process.env.MONGODB_URI;
  try {
    await mongoose.connect(uri);
    logger.info("MongoDB connected");
  } catch (err) {
    logger.error("MongoDB connection error", err);
    process.exit(1);
  }
};

module.exports = { connectDB };

// const { Sequelize } = require("sequelize");
// const logger = require("./winston");

// const sequelize = new Sequelize(
//   process.env.MYSQL_DB,
//   process.env.MYSQL_USER,
//   process.env.MYSQL_PASSWORD,
//   {
//     host: process.env.MYSQL_HOST,
//     port: process.env.MYSQL_PORT,
//     dialect: "mysql",
//     logging: false,
//   }
// );

// const connectDB = async () => {
//   try {
//     await sequelize.authenticate();
//     logger.info("MySQL connected");
//     await sequelize.sync(); // creates tables if they don't exist
//   } catch (err) {
//     logger.error("MySQL connection error", err);
//     process.exit(1);
//   }
// };

// module.exports = sequelize;
// module.exports.connectDB = connectDB;
