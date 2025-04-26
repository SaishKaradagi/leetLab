import express from "express";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/auth.routes.js";

import dotenv from "dotenv";

dotenv.config();
const app = express();

app.use(express.json());

app.use(cookieParser());

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.use("/api/v1/auth", authRoutes);
app.listen(process.env.PORT, () => {
  console.log(`Server is running on port ${process.env.PORT}`);
});
