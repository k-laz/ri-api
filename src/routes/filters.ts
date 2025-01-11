import { Router, Request, Response } from "express";
import { prisma } from "../models/index.js";
import { authenticateFirebaseToken } from "../middleware/auth.js"; // Middleware for Firebase authentication
import { Prisma } from "@prisma/client";
import { z } from "zod";

const router = Router();
type ValidNumber = 0 | 1 | 2 | 3 | 4;
const validNumbers: ValidNumber[] = [0, 1, 2, 3, 4];

const FilterSchema = z.object({
  min_price: z
    .number()
    .nonnegative("Min Price must be 0 or greater")
    .optional(),
  max_price: z.number().max(5000).optional(),
  move_in_date: z
    .string()
    .transform((val) => val || undefined)
    .optional(),
  num_beds: z
    .array(
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
  length_of_stay: z.enum(["4", "8", "12", "any"]).optional(),
  gender_preference: z.enum(["male", "female", "any", ""]).optional(),
});

type FilterInput = z.infer<typeof FilterSchema>;

// Update User Filter
router.put(
  "/update",
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

      const filterData: FilterInput = validationResult.data;

      // Find the user by Firebase UID
      const user = await prisma.user.findUnique({
        where: { firebaseUId },
      });

      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      // Prepare update data using Prisma's types
      const updateData: Prisma.UserFilterUpdateInput = {
        max_price:
          filterData.max_price !== undefined
            ? { set: filterData.max_price }
            : undefined,
        min_price:
          filterData.min_price !== undefined
            ? { set: filterData.min_price }
            : undefined,
        move_in_date:
          filterData.move_in_date !== undefined
            ? { set: new Date(filterData.move_in_date) }
            : undefined,
        length_of_stay:
          filterData.length_of_stay != undefined
            ? { set: filterData.length_of_stay }
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
          max_price: filterData.max_price,
          min_price: filterData.min_price,
          move_in_date: filterData.move_in_date
            ? new Date(filterData.move_in_date)
            : undefined,
          num_baths: filterData.num_baths,
          num_beds: filterData.num_beds,
          num_parking: filterData.num_parking,
          furnished: filterData.furnished,
          pets: filterData.pets,
          gender_preference: filterData.gender_preference,
          length_of_stay: filterData.length_of_stay,
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

// Get User Filter
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
