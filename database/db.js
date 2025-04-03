import "dotenv/config";
import Sequelize from "sequelize";

export const sequelize = new Sequelize(
  process.env.PGDATABASE,
  "postgres",
  process.env.PGPASSWORD,
  {
    host: process.env.PGHOST,
    dialect: "postgres",
  }
);
