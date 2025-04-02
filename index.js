import pg from "pg";
import express from "express";
import cors from "cors";

import app from "./app.js";
import StudentRoute from "./routes/student.route.js";

const { Client } = pg;

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});

//routes

/* const app = express(); */
app.use(express.json());

//middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use("/api/students", StudentRoute);

const con = new Client({
  host: "localhost",
  user: "postgres",
  port: 5432,
  database: "hasbara-donations",
  password: "1995",
});

con.connect().then(() => {
  console.log("connected");
});
