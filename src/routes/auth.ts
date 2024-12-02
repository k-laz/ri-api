import { Request, Response, Router } from "express";
import { prisma } from "../models/index.js";
import { sendVerificationEmail } from "../utils/helper.js";
import {
  generateVerificationToken,
  verifyJWTToken,
} from "../utils/tokenUtils.js";

const router = Router();

router.post("/resend-verification", async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    // Generate new token
    const { token, expiresAt } = generateVerificationToken(email);

    // Update user with new token
    await prisma.user.update({
      where: {
        email,
      },
      data: {
        verificationToken: token,
        verificationTokenExpires: expiresAt,
      },
    });

    // Send new verification email
    await sendVerificationEmail(email, token);

    res.json({ message: "Verification email resent" });
  } catch (error) {
    console.error("Resend verification error:", error);
    res.status(500).json({ error: "Error resending verification email" });
  }
});

router.post("/verify-email", async (req: Request, res: Response) => {
  try {
    const { token } = req.query;

    if (!token || typeof token !== "string") {
      return res.status(400).json({
        error: "Invalid token",
      });
    }

    const decoded = verifyJWTToken(token);

    if (!decoded) {
      return res.status(400).json({ error: "Invalid or expired token" });
    }

    // Update user verification status
    const user = await prisma.user.update({
      where: {
        email: decoded.email,
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
