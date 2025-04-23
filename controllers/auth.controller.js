import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

import { User } from "../models/users.model.js";
import { Store } from "../models/stores.model.js";
import { generateRandomStoreName } from "../utils.js";

import "dotenv/config";

export const createToken = async (userId) =>
  jwt.sign({ userId }, process.env.JWT_SECRET_KEY, {
    expiresIn: process.env.JWT_EXPIRATION_TIME,
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

export const userSignup = async (req, res) => {
  try {
    const { first_name, last_name, email, password, role_id = 1 } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res
        .status(409)
        .json({ type: "email", message: "Email already in use" });
    }

    // Create a store with random name
    const storeName = generateRandomStoreName();

    const store = await Store.create({
      name: storeName,
    });

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create the user
    const user = await User.create({
      first_name,
      last_name,
      email,
      password: hashedPassword,
      role_id,
      store_id: store.id,
    });

    // Generate token
    const token = await createToken(user.id);

    res.setHeader("Content-Type", "application/json");
    res.status(201);
    res.json({
      token,
      data: user,
      store: {
        id: store.id,
        name: store.name,
        domain: store.domain,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
