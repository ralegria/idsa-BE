import { User } from "../models/users.model.js";
import bcrypt from "bcrypt";
import { createToken } from "./auth.controller.js";

export const getUsers = async (_, res) => {
  try {
    const users = await User.findAll({ where: { isDeleted: false } });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const verifyEmailExists = async (req, res) => {
  try {
    const user = await User.findOne({
      where: { email: req.params.email },
    });

    if (user) {
      return res.status(500).json({ message: "Email account already in use." });
    }

    if (!user) {
      return res.status(200).json({ message: "Email account available." });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getSingleUser = async (req, res) => {
  try {
    const user = await User.findOne({ where: { short_id: req.params.id } });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createUser = async (req, res) => {
  try {
    // Check if the email already exists
    const existingUser = await User.findOne({
      where: { email: req.body.email },
    });

    if (existingUser) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const { password } = req.body;
    const hashedPass = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      ...req.body,
      password: hashedPass,
    });

    const token = await createToken(newUser.id);

    res.setHeader("Content-Type", "application/json");
    res.status(201);
    res.json({ token, data: newUser });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateUser = async (req, res) => {
  try {
    const user = await User.findOne({ where: { short_id: req.params.id } });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    await user.update(req.body);
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const softDeleteUser = async (req, res) => {
  try {
    const deletedUser = await User.findOne({
      where: { short_id: req.params.id },
    });

    if (!deletedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    await deletedUser.update({ isDeleted: true });
    res.json(deletedUser);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
