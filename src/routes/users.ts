import { Router, Request, Response } from "express";
import { prisma, UserFilter } from "../models/index.js";
import { authenticateFirebaseToken } from "../middleware/auth.js"; // Middleware for Firebase authentication
import { getAllFilteredListings } from "../utils/helper.js";
import { Prisma } from "@prisma/client";

import { z } from "zod";

const router = Router();
type ValidNumber = 0 | 1 | 2 | 3 | 4;
const validNumbers: ValidNumber[] = [0, 1, 2, 3, 4];

const FilterSchema = z.object({
  price_limit: z
    .number()
    .nonnegative("Price limit must be 0 or greater")
    .optional(),
  move_in_date: z
    .string()
    .transform((val) => val || undefined)
    .optional(),
  num_beds: z
    .array(
      // Direct number validation
      z
        .number()
        .int()
        .min(0)
        .max(4)
        .refine(
          (n): n is ValidNumber => validNumbers.includes(n as ValidNumber),
          {
            message: "Each value must be 0, 1, 2, 3, or 4",
          }
        )
    )
    .optional(),
  num_baths: z
    .array(z.number().int().min(0).max(4))
    .refine(
      (arr) => arr.every((n) => validNumbers.includes(n as ValidNumber)),
      {
        message: "Each value must be 0, 1, 2, 3, or 4",
      }
    )
    .optional(),
  num_parking: z
    .array(z.number().int().min(0).max(4))
    .refine(
      (arr) => arr.every((n) => validNumbers.includes(n as ValidNumber)),
      {
        message: "Each value must be 0, 1, 2, 3, or 4",
      }
    )
    .optional(),

  furnished: z.boolean().optional(),
  pets: z.boolean().optional(),
  gender_preference: z.enum(["male", "female", "any", ""]).optional(),
});

type FilterInput = z.infer<typeof FilterSchema>;

router.get(
  "/test",
  authenticateFirebaseToken,
  async (req: Request, res: Response) => {
    res.status(200).json("test route");
  }
);

router.post("/sync", async (req: Request, res: Response) => {
  try {
    const { firebaseUId, email } = req.body;

    // Find the user by Firebase UID and include the associated filters and listings
    const user = await prisma.user.findUnique({
      where: { firebaseUId },
    });

    if (!user) {
      const newUser = await prisma.user.create({
        data: {
          firebaseUId: firebaseUId, // Make sure these match your schema
          email: email,
          role: "user",
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
        firebaseUId: firebaseUId, // Make sure these match your schema
        email: email,
        role: "user",
      },
    });

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

router.get(
  "/me",
  authenticateFirebaseToken,
  async (req: Request, res: Response) => {
    try {
      const firebaseUId = req.user?.uid;

      console.log(firebaseUId);
      // Find the user by Firebase UID and include the associated filters and listings
      const user = await prisma.user.findUnique({
        where: { firebaseUId },
      });

      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      return res.status(200).json(user); // Added return here
    } catch (error) {
      // Added return here and handling for non-Error objects
      return res.status(500).json({
        error:
          error instanceof Error ? error.message : "An unknown error occurred",
      });
    }
  }
);

router.get(
  "/me/data",
  authenticateFirebaseToken,
  async (req: Request, res: Response) => {
    try {
      const firebaseUId = req.user?.uid;

      // Find the user by Firebase UID and include the associated filters
      const user = await prisma.user.findUnique({
        where: { firebaseUId },
        include: { filter: true },
      });

      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      res.status(200).json(user);
    } catch (error) {
      // Added return here and handling for non-Error objects
      return res.status(500).json({
        error:
          error instanceof Error ? error.message : "An unknown error occurred",
      });
    }
  }
);

router.put(
  "/me/filter",
  authenticateFirebaseToken,
  async (req: Request, res: Response) => {
    try {
      const firebaseUId = req.user?.uid;

      if (!firebaseUId) {
        return res.status(401).json({ error: "No authenticated user found" });
      }

      // Validate the input data
      const validationResult = FilterSchema.safeParse(req.body.filter);

      if (!validationResult.success) {
        console.log(req.body.filter);
        return res.status(400).json({
          error: "Invalid filter data",
          details: validationResult.error.errors,
        });
      }

      const filterData = validationResult.data;

      // Find the user by Firebase UID
      const user = await prisma.user.findUnique({
        where: { firebaseUId },
      });

      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      // Prepare update data using Prisma's types
      const updateData: Prisma.UserFilterUpdateInput = {
        price_limit:
          filterData.price_limit !== undefined
            ? { set: filterData.price_limit }
            : undefined,
        move_in_date:
          filterData.move_in_date !== undefined
            ? { set: new Date(filterData.move_in_date) }
            : undefined,
        num_baths:
          filterData.num_baths !== undefined
            ? { set: filterData.num_baths }
            : undefined,
        num_beds:
          filterData.num_beds !== undefined
            ? { set: filterData.num_beds }
            : undefined,
        num_parking:
          filterData.num_parking !== undefined
            ? { set: filterData.num_parking }
            : undefined,
        furnished:
          filterData.furnished !== undefined
            ? { set: filterData.furnished }
            : undefined,
        pets:
          filterData.pets !== undefined ? { set: filterData.pets } : undefined,
        gender_preference:
          filterData.gender_preference !== undefined
            ? { set: filterData.gender_preference }
            : undefined,
      };

      // Check if the user already has a filter
      const existingFilter = await prisma.userFilter.findUnique({
        where: { userId: user.id },
      });

      let updatedFilter;

      if (existingFilter) {
        updatedFilter = await prisma.userFilter.update({
          where: { userId: user.id },
          data: updateData,
        });
      } else {
        // For create operation, we need to transform the data differently
        const createData: Prisma.UserFilterCreateInput = {
          price_limit: filterData.price_limit,
          move_in_date: filterData.move_in_date
            ? new Date(filterData.move_in_date)
            : undefined,
          num_baths: filterData.num_baths,
          num_beds: filterData.num_beds,
          num_parking: filterData.num_parking,
          furnished: filterData.furnished,
          pets: filterData.pets,
          gender_preference: filterData.gender_preference,
          user: {
            connect: {
              id: user.id,
            },
          },
        };

        updatedFilter = await prisma.userFilter.create({
          data: createData,
        });
      }

      return res.status(200).json(updatedFilter);
    } catch (error) {
      console.error("Filter update error:", error);
      return res.status(500).json({
        error:
          error instanceof Error ? error.message : "An unknown error occurred",
      });
    }
  }
);

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

router.get(
  "/me/filter",
  authenticateFirebaseToken,
  async (req: Request, res: Response) => {
    try {
      const firebaseUId = req.user?.uid;

      // Find the user by Firebase UID and include the associated filters
      const user = await prisma.user.findUnique({
        where: { firebaseUId },
        include: { filter: true }, // Assuming "filter" is the name of the relation
      });

      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      res.status(200).json(user.filter);
    } catch (error) {
      if (error instanceof Error) {
        res.status(500).json({ error: error.message });
      }
    }
  }
);

export default router;
