require("dotenv").config();
const sequelize = require("./src/config/database");

(async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ Connection has been established successfully.");
    await sequelize.sync(); // creates tables if they don't exist
    console.log("✅ Models synchronized.");
    process.exit(0);
  } catch (error) {
    console.error("❌ Unable to connect to the database:", error);
    process.exit(1);
  }
})();
