import { db } from "../libs/db.js";
import bcrypt from "bcrypt";
import { UserRole } from "../generated/prisma/index.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

const register = async (req, res) => {
  const { email, password, name } = req.body;

  try {
    const existingUser = await db.user.findUnique({
      where: {
        email: email,
      },
    });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashPassword = await bcrypt.hash(password, 10);
    const newUser = await db.user.create({
      data: {
        email: email,
        password: hashPassword,
        name: name,
        role: UserRole.USER,
      },
    });

    const token = jwt.sign(
      {
        id: newUser.id,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );

    res.cookie("jwt", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV !== "development",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.status(201).json(
      { success: true },
      {
        message: "User created successfully",
        user: {
          id: newUser.id,
          email: newUser.email,
          name: newUser.name,
          role: newUser.role,
          image: newUser.image,
        },
      }
    );
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({ message: "Error creating user" });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await db.user.findUnique({
      where: {
        email: email,
      },
    });
    if (!user) {
      return res.status(401).json({ error: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid credentials" });
    }
    const token = jwt.sign(
      {
        id: user.id,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );
    res.cookie("jwt", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV !== "development",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
    res.status(200).json({
      message: "User logged in successfully",
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        image: user.image,
      },
    });
  } catch (error) {
    console.error("Error logging in user:", error);
    res.status(500).json({ error: "Error logging in user" });
  }
};

const logout = async (req, res) => {
  try {
    res.clearCookie("jwt", {
      httpOnly: true,
      secure: process.env.NODE_ENV !== "development",
      sameSite: "strict",
    });
    res.status(200).json({
      success: true,
      message: "User logged out successfully",
    });
  } catch (error) {
    console.error("Error logging out user:", error);
    res.status(500).json({ error: "Error logging out user" });
  }
};

const check = async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      message: "User is logged in",
      user: req.user,
    });
  } catch (error) {}
};

export { register, login, logout, check };
