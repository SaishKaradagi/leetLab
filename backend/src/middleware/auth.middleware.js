import jwt from "jsonwebtoken";
import { db } from "../libs/db.js";

const authMiddleware = async (req, res, next) => {
  try {
    const token = req.cookies.jwt;
    if (!token) {
      return res.status(401).json({ message: "Unauthorized: No token found" });
    }

    let decodedToken;
    try {
      decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      return res.status(401).json({ message: "Unauthorized: Invalid token" });
    }

    const user = await db.user.findUnique({
      where: { id: decodedToken.id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        image: true,
      },
    });

    if (!user) {
      return res.status(401).json({ message: "Unauthorized: User not found" });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("Error in auth middleware:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export default authMiddleware;
