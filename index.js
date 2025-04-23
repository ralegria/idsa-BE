import "dotenv/config";

import app from "./app.js";
import { sequelize } from "./database/db.js";

// Import models
import "./models/users.model.js";
import "./models/roles.model.js";
import { defineStoreRelationships } from "./models/stores.model.js";

const main = async () => {
  const PORT = process.env.SERVER_PORT || 4000;
  try {
    // Define relationships between models
    defineStoreRelationships();
    
    await sequelize.sync({ force: false });
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Unable to start the server:", error);
  }
};

main();

