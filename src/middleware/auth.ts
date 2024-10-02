import { Request, Response, NextFunction } from "express";
import admin from "../firebaseAdmin.js"; // Firebase Admin SDK for verifying tokens
import { PrismaClient } from "@prisma/client"; // To check user roles (if necessary)

const prisma = new PrismaClient();

// Middleware to verify Firebase ID tokens
export const authenticateFirebaseToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split("Bearer ")[1]; // Extract token from Bearer token header

  if (!token) {
    return res.status(401).json({ error: "Unauthorized: No token provided" });
  }

  try {
    const decodedToken = await admin.auth().verifyIdToken(token); // Verify the token with Firebase Admin SDK
    req.user = { uid: decodedToken.uid }; // Attach the Firebase UID to the request object
    next(); // Proceed to the next middleware or route handler
  } catch (error) {
    return res.status(401).json({ error: "Unauthorized: Invalid token" });
  }
};

// Middleware to authorize admin users only
export const authorizeAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const firebaseUId = req.user?.uid;

  if (!firebaseUId) {
    return res.status(401).json({ error: "Unauthorized: No Firebase UID" });
  }

  try {
    // Find the user in the PostgreSQL database using Prisma
    const user = await prisma.user.findUnique({
      where: { firebaseUId },
    });

    // Check if the user exists and if their role is admin
    if (user && user.role === "admin") {
      next(); // User is admin, proceed to the next middleware or route handler
    } else {
      return res.status(403).json({ error: "Forbidden: Admin access only" });
    }
  } catch (error) {
    return res
      .status(500)
      .json({ error: "An error occurred during authorization" });
  }
};
