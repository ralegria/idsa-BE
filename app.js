import express from "express";
import cors from "cors";
import UsersRoute from "./routes/users.route.js";
import GoalsRoute from "./routes/goals.route.js";
import DonationsRoute from "./routes/donations.route.js";
import AuthRoute from "./routes/auth.route.js";
import InventoryRoute from "./routes/inventory.route.js";

const app = express();

//Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

//Routes
app.use("/api/users", UsersRoute);
app.use("/api/goals", GoalsRoute);
app.use("/api/donations", DonationsRoute);
app.use("/api/auth", AuthRoute);
app.use("/api/inventory", InventoryRoute);

export default app;
