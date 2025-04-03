import { User } from "../models/users.model.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

import "dotenv/config";

export const createToken = async (userId) =>
  jwt.sign({ userId }, process.env.JWT_SECRET_KEY, {
    expiresIn: "1h",
  });

export const verifyToken = async (req, res, next) => {
  const token = req?.headers?.authorization?.split(" ")[1];
  if (!token) {
    return res.status(401).json({ message: "Access Denied" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error, message: error.message });
  }
};

export const userLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res
        .status(404)
        .json({ type: "email", message: "Incorrect Email" });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res
        .status(401)
        .json({ type: "password", message: "Incorrect password" });
    }

    const token = await createToken(user.id);

    res.setHeader("Content-Type", "application/json");
    res.status(201);
    res.json({ token, data: user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
