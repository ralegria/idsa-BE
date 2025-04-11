import PG from "pg";
import "dotenv/config";

const { Client } = PG;

const dbConfig = {
  user: "postgres",
  host: process.env.PGHOST,
  database: process.env.PGDATABASE,
  password: process.env.PGPASSWORD,
  port: 5432, // Default PostgreSQL port
};

export const connectToDatabase = async () => {
  const client = new Client(dbConfig);
  try {
    await client.connect();
    console.log("Connected to PostgreSQL database");
    return client;
  } catch (error) {
    console.error("Error connecting to PostgreSQL:", error);
    throw error;
  }
};
