// middleware/verificationCheck.ts
import { Request, Response, NextFunction } from "express";
import { prisma } from "../models/index.js";

export const checkVerification = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Get Firebase token from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res
        .status(401)
        .json({ error: "No authentication token provided" });
    }

    const token = authHeader.split(" ")[1];
    const decodedToken = await auth.verifyIdToken(token);

    // Check user verification status in your database
    const user = await prisma.user.findUnique({
      where: {
        email: decodedToken.email,
      },
      select: {
        isVerified: true,
        verificationTokenExpires: true,
      },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Check if token has expired but user isn't verified
    if (
      !user.isVerified &&
      user.verificationTokenExpires &&
      user.verificationTokenExpires < new Date()
    ) {
      return res.status(403).json({
        error: "Email verification expired",
        code: "VERIFICATION_EXPIRED",
        message: "Please request a new verification email",
      });
    }

    next();
  } catch (error) {
    console.error("Verification check error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
