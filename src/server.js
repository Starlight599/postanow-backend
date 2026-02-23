require("dotenv").config();
require("./config/database");   // 👈 ADD THIS LINE

const app = require("./app");

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 PostaNow API running on port ${PORT}`);
});
