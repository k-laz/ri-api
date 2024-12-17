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
      const newListings = await prisma.listing.findMany({
        where: {
          isSent: false,
        },
        include: {
          listingParameters: true,
        },
      });

      if (!newListings.length) {
        return res.status(200).json({ message: "No new listings to process." });
      }

      const users = await prisma.user.findMany({
        where: {
          filter: { isNot: null },
          isVerified: true,
        },
        include: {
          filter: true,
        },
      });

      if (!users.length) {
        return res.status(200).json({ message: "No subscribed users found." });
      }

      const sentListingsIds = new Set<number>();
      const emailErrors: Array<{ email: string; error: string }> = [];
      const BATCH_SIZE = 50;

      for (let i = 0; i < users.length; i += BATCH_SIZE) {
        const userBatch = users.slice(i, i + BATCH_SIZE);

        await Promise.all(
          userBatch.map(async (user) => {
            try {
              if (!user.filter) return;

              const matchedListings = newListings.filter((listing) =>
                filterListing(listing, user.filter as UserFilter)
              );

              if (matchedListings.length === 0) return;

              // Format price and prepare template data
              const templateData = {
                listings: matchedListings.map((listing) => {
                  const price = listing.listingParameters?.price;
                  const formattedPrice = price
                    ? new Intl.NumberFormat("en-US", {
                        style: "currency",
                        currency: "CAD",
                      }).format(price)
                    : "Price not specified";

                  return {
                    title: `${listing.title} - ${formattedPrice}/month`,
                    url: `${listing.link}`,
                  };
                }),
                unsubscribeUrl: user.unsubscribeToken
                  ? `${process.env.FRONTEND_URL}/unsubscribe?token=${user.unsubscribeToken}`
                  : `${process.env.FRONTEND_URL}/settings`,
              };

              await sendListingEmail(
                user.email,
                templateData.listings,
                templateData.unsubscribeUrl
              );

              matchedListings.forEach((listing) =>
                sentListingsIds.add(listing.id)
              );
            } catch (error) {
              emailErrors.push({
                email: user.email,
                error: error instanceof Error ? error.message : "Unknown error",
              });
            }
          })
        );
      }

      if (sentListingsIds.size > 0) {
        await prisma.listing.updateMany({
          where: {
            id: { in: Array.from(sentListingsIds) },
          },
          data: {
            isSent: true,
          },
        });
      }

      // TODO: figure out reason for this
      // if (emailErrors.length > 0) {
      //   await prisma.emailError.createMany({
      //     data: emailErrors.map((error) => ({
      //       email: error.email,
      //       error: error.error,
      //       attemptedAt: new Date(),
      //     })),
      //   });
      // }

      return res.status(200).json({
        message: "Newsletter processing completed",
        stats: {
          totalListings: newListings.length,
          sentListings: sentListingsIds.size,
          processedUsers: users.length,
          emailErrors: emailErrors.length,
        },
      });
    } catch (error) {
      console.error("Error processing newsletter:", error);
      return res.status(500).json({
        error: "Failed to process newsletter",
        details: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }
);

export default router;
