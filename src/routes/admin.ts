import { Router, Request, Response } from "express";
import { Listing, prisma, UserFilter } from "../models/index.js";
import {
  authenticateFirebaseToken,
  authorizeAdmin,
} from "../middleware/auth.js";
import { filterListing } from "../utils/helper.js";
import { sendListingEmail } from "../utils/mailer.js";

const router = Router();

router.post(
  "/send-newsletter",
  authenticateFirebaseToken,
  authorizeAdmin,
  async (req: Request, res: Response) => {
    try {
      // TODO: WHY? Get listings added that have not been sent
      const newListings: Listing[] = await prisma.listing.findMany({
        where: {
          isSent: false, // Only get listings that have not been sent
        },
        include: {
          listingParameters: true, // Include parameters for filtering
        },
      });

      if (!newListings.length) {
        return res.status(404).json({ message: "No new listings found." });
      }

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

      // Track which listings have been sent
      const sentListingsIds = new Set<number>();

      // Process users in batches (optional optimization for large user base)
      const BATCH_SIZE = 50;
      for (let i = 0; i < users.length; i += BATCH_SIZE) {
        const userBatch = users.slice(i, i + BATCH_SIZE);

        // Handle batch of users asynchronously
        await Promise.all(
          userBatch.map(async (user) => {
            if (user.filter) {
              // Use the refactored function to get the filtered listings
              const matchedListings = newListings.filter((listing: Listing) =>
                filterListing(listing, user.filter as UserFilter)
              );

              if (matchedListings.length > 0) {
                // Generate email content based on matched listings
                const emailContent = generateEmailContent(matchedListings);
                console.log(emailContent);

                try {
                  await sendListingEmail(user.email, emailContent);

                  // Add matched listing IDs to the sent listings set
                  matchedListings.forEach((listing) =>
                    sentListingsIds.add(listing.id)
                  );
                } catch (err) {
                  console.error(`Failed to send email to ${user.email}`, err);
                  // Optionally, log failed attempts or retry
                }
              }
            }
          })
        );
      }

      // Update the listings in the database to mark them as sent
      if (sentListingsIds.size > 0) {
        await prisma.listing.updateMany({
          where: {
            id: { in: Array.from(sentListingsIds) },
          },
          data: { isSent: true },
        });
      }

      res.status(200).json({ message: "Newsletter emails sent successfully." });
    } catch (error) {
      console.error("Error sending newsletter:", error);
      res
        .status(500)
        .json({ error: "An error occurred while sending newsletters." });
    }
  }
);

// Helper function to generate email content based on matched listings
const generateEmailContent = (listings: Listing[]): string => {
  return listings
    .map((listing) => `- ${listing.title} | ${listing.link}`)
    .join("\n");
};

export default router;
