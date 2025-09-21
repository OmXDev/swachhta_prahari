const axios = require("axios");
const cron = require("node-cron");

const keepServerAlive = async () => {
  const url = process.env.SERVER_URL;
  if (!url) {
    console.error("Cron():: " + "Origin url is not there...");
    return;
  }
  cron.schedule(
    "0 */13 * * * *",
    async () => {
      try {
        const response = await axios.get(`${url}/cron/wake`);
        console.info("keepServerAlive():: " + response.data.message);
      } catch (error) {
        console.error("keepServerAlive():: " + error.message);
      }
    },
    {
      timezone: "Asia/Kolkata",
    },
  );
};

module.exports = { keepServerAlive };
