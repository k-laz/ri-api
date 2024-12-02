import { Request, Response, Router } from "express";
import { prisma } from "../models/index.js";

const router = Router();

router.post("/verify-email", async (req: Request, res: Response) => {
  try {
    const { token } = req.query;

    if (!token || typeof token !== "string") {
      return res.status(400).json({
        error: "Invalid token",
      });
    }

    const user = await prisma.user.findFirst({
      where: {
        verificationToken: token,
        verificationTokenExpires: {
          // checks if the verification is still valid
          gt: new Date(),
        },
      },
      select: {
        id: true,
        email: true,
        isVerified: true,
      },
    });

    if (!user) {
      return res.status(400).json({
        error: "Invalid or expired verification token",
      });
    }

    // Update user verification status
    await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        isVerified: true,
        verificationToken: null,
        verificationTokenExpires: null,
      },
    });

    res.json({ message: "Email verified successfully" });
  } catch (error) {
    console.error("Verification error:", error);
    res.status(500).json({ error: "Error verifying email" });
  }
});

export default router;
