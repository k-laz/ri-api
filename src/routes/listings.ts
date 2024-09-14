import { Router, Request, Response } from "express";
import { ListingParameters, prisma } from "../models/index.js";
import {
  authenticateFirebaseToken,
  authorizeAdmin,
} from "../middleware/auth.js";
import generateListingHash from "../utils/hash.js";

const router = Router();

type ListingData = {
  hash?: string;
  title: string;
  link: string;
  pub_date: Date;
  parameters: ListingParameters;
};

router.post(
  "/add/bulk",
  authenticateFirebaseToken,
  authorizeAdmin,
  async (req: Request, res: Response) => {
    try {
      const { Listings }: { Listings: ListingData[] } = req.body;
      const createdListingIds: number[] = [];

      for (const listingData of Listings) {
        const hash = generateListingHash(listingData.link);

        // Check if the listing with the hash already exists
        const existingListing = await prisma.listing.findUnique({
          where: { hash },
        });

        if (!existingListing) {
          // Create a new listing if it does not exist
          const createdListing = await prisma.listing.create({
            data: {
              hash,
              title: listingData.title,
              link: listingData.link,
              pub_date: listingData.pub_date,
              listingParameters: {
                create: {
                  ...listingData.parameters,
                },
              },
            },
          });

          createdListingIds.push(createdListing.id);
        }
      }

      res.status(201).json({ listings: createdListingIds });
    } catch (error) {
      console.error("Error adding listings in bulk:", error);
      res
        .status(500)
        .json({ error: "An error occurred while adding listings" });
    }
  }
);

export default router;
