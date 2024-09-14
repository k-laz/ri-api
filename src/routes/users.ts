import { Router, Request, Response } from "express";
import { prisma } from "../models/index.js";
import { authenticateFirebaseToken } from "../middleware/auth.js"; // Middleware for Firebase authentication

const router = Router();

router.get("/test", async (req: Request, res: Response) => {
  res.status(200).json("test route");
});

router.get(
  "/me",
  authenticateFirebaseToken,
  async (req: Request, res: Response) => {
    try {
      const firebaseUId = req.user?.uid;

      // Find the user by Firebase UID and include the associated filters and listings
      const user = await prisma.user.findUnique({
        where: { firebaseUId },
      });

      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      res.status(200).json(user);
    } catch (error) {
      if (error instanceof Error)
        res.status(500).json({ error: error.message });
    }
  }
);

export default router;
