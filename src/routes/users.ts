import { Router, Request, Response } from "express";
import { prisma, UserFilter } from "../models/index.js";
import { authenticateFirebaseToken } from "../middleware/auth.js"; // Middleware for Firebase authentication
import { getFilteredListings } from "../utils/helper.js";

const router = Router();

router.get("/test", async (req: Request, res: Response) => {
  res.status(200).json("test route");
});

router.post("/add", async (req: Request, res: Response) => {
  try {
    const { firebaseUId, email } = req.body;

    // Check if firebaseUId and email are provided
    if (!firebaseUId || !email) {
      return res
        .status(400)
        .json({ error: "Firebase UID and email are required" });
    }

    // Check if the user already exists (by email or Firebase UID)
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { firebaseUId }],
      },
    });

    if (existingUser) {
      return res
        .status(409)
        .json({ error: "User with this email or Firebase UID already exists" });
    }

    // Create a new user, including the required role field
    const newUser = await prisma.user.create({
      data: {
        firebaseUId,
        email,
        role: "user",
      },
    });

    res
      .status(201)
      .json({ message: "User created successfully", user: newUser });
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ error: error.message });
    }
  }
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

router.put(
  "/filter",
  authenticateFirebaseToken,
  async (req: Request, res: Response) => {
    try {
      const firebaseUId = req.user?.uid;
      const filterData = req.body;

      // Find the user by Firebase UID
      const user = await prisma.user.findUnique({
        where: { firebaseUId },
      });

      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      // Check if the user already has a filter
      const existingFilter = await prisma.userFilter.findUnique({
        where: { userId: user.id },
      });

      let updatedFilter;

      if (existingFilter) {
        // Update the existing filter
        updatedFilter = await prisma.userFilter.update({
          where: { userId: user.id },
          data: {
            price_limit: filterData.price_limit,
            move_in_date: new Date(filterData.move_in_date),
            num_baths: filterData.num_baths,
            num_beds: filterData.num_beds,
            num_parking: filterData.num_parking,
            furnished: filterData.furnished,
            pets: filterData.pets,
            gender_preference: filterData.gender_preference,
          },
        });
      } else {
        // Create a new filter for the user
        updatedFilter = await prisma.userFilter.create({
          data: {
            price_limit: filterData.price_limit,
            move_in_date: new Date(filterData.move_in_date),
            num_baths: filterData.num_baths,
            num_beds: filterData.num_beds,
            num_parking: filterData.num_parking,
            furnished: filterData.furnished,
            pets: filterData.pets,
            gender_preference: filterData.gender_preference,
            userId: user.id,
          },
        });
      }

      res.status(200).json(updatedFilter);
    } catch (error) {
      if (error instanceof Error) {
        res.status(500).json({ error: error.message });
      }
    }
  }
);

router.get(
  "/listings",
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

      const listings = await getFilteredListings(user.filter);

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

export default router;
