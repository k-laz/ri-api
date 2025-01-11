import { Router, Request, Response } from "express";
import { prisma } from "../models/index.js";
import { authenticateFirebaseToken } from "../middleware/auth.js"; // Middleware for Firebase authentication
import { getAllFilteredListings } from "../utils/helper.js";
import { generateVerificationToken } from "../utils/tokenUtils.js";
import { sendVerificationEmail } from "../services/emailService.js";
import { generateUnsubscribeToken } from "../utils/hash.js";

const router = Router();

router.get(
  "/test",
  authenticateFirebaseToken,
  async (req: Request, res: Response) => {
    res.status(200).json("test route");
  }
);

// Sync user with backend
router.post("/sync", async (req: Request, res: Response) => {
  try {
    const { firebaseUId, email } = req.body;

    // Find the user by Firebase UID and include the associated filters and listings
    const user = await prisma.user.findUnique({
      where: { firebaseUId },
    });

    if (!user) {
      // Generate verification token
      const { token, expiresAt } = generateVerificationToken(email);

      const newUser = await prisma.user.create({
        data: {
          firebaseUId: firebaseUId,
          email: email,
          role: "user",
          verificationToken: token,
          verificationTokenExpires: expiresAt,
          unsubscribeToken: generateUnsubscribeToken(),
          isVerified: false,
        },
      });
      return res
        .status(201)
        .json({ message: "User created successfully", user: newUser });
    }

    return res.status(200).json(user);
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ error: error.message });
    }
  }
});

// Create new user
router.post("/create", async (req: Request, res: Response) => {
  try {
    const { firebaseUId, email } = req.body;

    // Check if firebaseUId and email are provided
    if (!firebaseUId || !email) {
      return res
        .status(400)
        .json({ error: "Firebase UID and email are required" });
    }

    // Check if the user already exists (by email or Firebase UID)
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res
        .status(409)
        .json({ error: "User with this email already exists" });
    }

    // Generate verification token
    const { token, expiresAt } = generateVerificationToken(email);

    // Create a new user, including the required role field
    const newUser = await prisma.user.create({
      data: {
        firebaseUId: firebaseUId,
        email: email,
        role: "user",
        verificationToken: token,
        verificationTokenExpires: expiresAt,
        unsubscribeToken: generateUnsubscribeToken(),
        isVerified: false,
      },
    });

    await sendVerificationEmail(newUser.email, token);

    return res
      .status(201)
      .json({ message: "User created successfully", user: newUser });
  } catch (error) {
    // Added return and improved error handling
    return res.status(500).json({
      error:
        error instanceof Error ? error.message : "An unknown error occurred",
    });
  }
});

// TODO: figure out a way to protect this route - who can delete users and what inits it?
// Delete User
router.delete(
  "/delete", // "/delete/:firebaseUId",
  authenticateFirebaseToken,
  async (req: Request, res: Response) => {
    try {
      const firebaseUId = req.user?.uid;
      // const { firebaseUId } = req.params;

      if (!firebaseUId) {
        return res.status(400).json({ error: "Firebase UID is required" });
      }

      // Find the user first to make sure they exist
      const existingUser = await prisma.user.findUnique({
        where: { firebaseUId },
      });

      if (!existingUser) {
        return res.status(404).json({ error: "User not found" });
      }

      await prisma.user.delete({
        where: {
          id: existingUser.id,
        },
      });

      return res.status(200).json({
        message: "User and all related data successfully deleted",
      });
    } catch (error) {
      console.error("Error deleting user:", error);
      return res.status(500).json({
        error:
          error instanceof Error ? error.message : "An unknown error occurred",
      });
    }
  }
);

// Get User Data
router.get(
  "/me/data",
  authenticateFirebaseToken,
  async (req: Request, res: Response) => {
    try {
      const firebaseUId = req.user?.uid;

      // Find the user by Firebase UID and include the associated filters and listings
      const user = await prisma.user.findUnique({
        where: { firebaseUId },
        include: { filter: true }, // Assuming "filter" is the name of the relation
      });

      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      // For now user data is just filter
      const userData = {
        filter: user.filter,
        email: user.email,
        isVerified: user.isVerified,
        isSubscribed: user.isSubscribed,
      };

      return res.status(200).json(userData); // Added return here
    } catch (error) {
      // Added return here and handling for non-Error objects
      return res.status(500).json({
        error:
          error instanceof Error ? error.message : "An unknown error occurred",
      });
    }
  }
);

// Get User Listings
router.get(
  "me/listings",
  authenticateFirebaseToken,
  async (req: Request, res: Response) => {
    try {
      const firebaseUId = req.user?.uid;

      // Find the user by Firebase UID and include the associated filters
      const user = await prisma.user.findUnique({
        where: { firebaseUId },
        include: { filter: true }, // Assuming "filter" is the name of the relation
      });

      if (!user || !user.filter) {
        return res.status(404).json({ error: "User or filters not found" });
      }

      const listings = await getAllFilteredListings(user.filter);

      if (!listings.length) {
        return res
          .status(404)
          .json({ message: "No listings match your filters" });
      }

      res.status(200).json(listings);
    } catch (error) {
      if (error instanceof Error) {
        res.status(500).json({ error: error.message });
      }
    }
  }
);
router.patch("/unsubscribe", async (req: Request, res: Response) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        error: "Unsubscribe token is required",
      });
    }

    // Find user by unsubscribe token
    const updatedUser = await prisma.user.update({
      where: {
        unsubscribeToken: token, // Use token instead of firebaseUId
      },
      data: {
        isSubscribed: false,
        // Generate new token for future use
        unsubscribeToken: generateUnsubscribeToken(),
      },
      select: {
        email: true,
        isSubscribed: true,
      },
    });

    return res.json({
      message: "Successfully unsubscribed from notifications",
      email: updatedUser.email,
      isSubscribed: updatedUser.isSubscribed,
    });
  } catch (error) {
    // If token not found, Prisma will throw
    if (error instanceof Error) {
      console.log(error);
    }

    console.error("Unsubscribe error:", error);
    return res.status(500).json({
      error:
        error instanceof Error ? error.message : "An unknown error occurred",
    });
  }
});

// Optional: Add an error handler middleware
router.use((error: Error, req: Request, res: Response, next: Function) => {
  console.error("User creation error:", error);
  res.status(500).json({
    error: "Internal server error during user creation",
  });
});

export default router;
