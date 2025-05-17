import jwt from "jsonwebtoken";
import {db} from "../libs/db.js";
export const authMiddleware = async (req, res, next) => {
    try {
        const token = req.cookies.jwt;

        if(!token){
            return res.status(401).json({
                success: false,
                message: "Unauthorized - No token provided" 
            });
        }
        
        let decoded;

        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET);
        } catch (error) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized - Invalid token"
            });
        }

        const user = await db.user.findUnique({
            where: {
                id: decoded.id
            },
            select:{
                id: true,
                name: true,
                email: true,
                role: true,
                image: true
            }
        });
        if(!user){
            return res.status(401).json({
                success: false,
                message: "Unauthorized - User not found"
            });
        }
        req.user = user;
        next();
    } catch (error) {
        console.error("Error in auth middleware:", error);
        res.status(500).json({ message: "Internal server error" });
        
    }
}

export const checkAdmin = async(req, res, next) => {
    try {
        const userid = req.user.id;
        const user = await db.user.findUnique({
            where: {
                id: userid
            },
            select:{
                role: true
            }
        });
        if(!user || user.role !== "ADMIN"){
            return res.status(401).json({
                success: false,
                message: "Unauthorized - Access denied - Admin only"
            });
        }
        next();
    } catch (error) {
        console.error("Error in checkAdmin middleware:", error);
        res.status(500).json({ message: "Error checking admin role" });
    }
}