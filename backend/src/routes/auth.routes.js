import express from "express";
import {
  register,
  login,
  logout,
  check,
} from "../controllers/auth.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";
const authRoutes = express.Router();

authRoutes.post("/register", register);
authRoutes.get("/login", login);
authRoutes.get("/logout", authMiddleware, logout);
authRoutes.get("/check", authMiddleware, check);

export default authRoutes;
