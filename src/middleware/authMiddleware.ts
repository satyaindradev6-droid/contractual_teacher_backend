import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { prisma } from "../utils/prisma";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production";

interface JwtPayload {
  userId: string;
  mobile_no: string;
}

export const authenticateToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: "Token required"
      });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
    
    // Debug: Log token verification
    console.log('🔍 JWT Token Verified:', {
      userId: decoded.userId,
      currentTime: new Date().toISOString()
    });

    const user = await prisma.applications.findUnique({
      where: {
        application_id: BigInt(decoded.userId)
      }
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found"
      });
    }

    (req as any).userId = decoded.userId;

    next();

  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid token"
    });
  }
};
