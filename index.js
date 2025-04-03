import "dotenv/config";

import app from "./app.js";
import { sequelize } from "./database/db.js";

/*
import "./models/users.model.js";
import "./models/roles.model.js";
import "./models/goals.model.js";
import "./models/donations.model.js";
*/

const main = async () => {
  const PORT = process.env.SERVER_PORT || 4000;
  try {
    //await sequelize.sync({ force: false });
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Unable to start the server:", error);
  }
};

main();
