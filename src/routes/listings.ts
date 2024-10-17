import { Router, Request, Response } from "express";
import { ListingParameters, prisma } from "../models/index.js";
import {
  authenticateFirebaseToken,
  authorizeAdmin,
} from "../middleware/auth.js";
import generateListingHash from "../utils/hash.js";
import { getAllFilteredListings } from "../utils/helper.js";

const router = Router();

type ListingData = {
  hash?: string;
  title: string;
  link: string;
  pub_date: Date;
  parameters: ListingParameters;
};

type ListingsByUser = {
  [userId: number]: any[]; // Assuming listings are arrays of any (you can replace `any` with a specific type if known)
};

router.get(
  "/retrieve-listings-by-user",
  async (req: Request, res: Response) => {
    try {
      // Get all users with filters set up
      const users = await prisma.user.findMany({
        where: {
          filter: {
            isNot: null, // Only get users who have a filter set
          },
        },
        include: {
          filter: true, // Include user filter for each user
        },
      });

      if (!users.length) {
        return res.status(404).json({ error: "No users with filters found." });
      }

      const listingsByUser: ListingsByUser = {};

      for (const user of users) {
        if (user.filter) {
          // Use the refactored function to get the filtered listings
          const listings = await getAllFilteredListings(user.filter);
          listingsByUser[user.id] = listings;
        }
      }

      if (Object.keys(listingsByUser).length === 0) {
        return res
          .status(404)
          .json({ message: "No listings found for any users." });
      }

      // Return listings for each user
      res.status(200).json(listingsByUser);
    } catch (error) {
      if (error instanceof Error)
        res.status(500).json({ error: error.message });
    }
  }
);

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

        listingData.parameters.availability = new Date(
          listingData.parameters.availability
        );

        if (!existingListing) {
          // Create a new listing if it does not exist
          const createdListing = await prisma.listing.create({
            data: {
              hash,
              title: listingData.title,
              link: listingData.link,
              pub_date: new Date(listingData.pub_date),
              listingParameters: {
                create: {
                  price: listingData.parameters.price,
                  availability: new Date(listingData.parameters.availability),
                  furnished: listingData.parameters.furnished,
                  num_beds: listingData.parameters.num_beds || null, // Default to null if not provided
                  num_baths: listingData.parameters.num_baths || null, // Default to null if not provided
                  pets: listingData.parameters.pets,
                  parking: listingData.parameters.parking,
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
