import { Listing, prisma } from "../models/index.js";
import AWS from "aws-sdk";

export async function filterListing(listing: Listing, userFilter: any) {
  try {
    const listings = await prisma.listingParameters.findMany({
      where: {
        AND: [
          {
            price: {
              lte: userFilter.price_limit, // Price <= user's limit
            },
          },
          {
            availability: {
              gte: userFilter.move_in_date, // Available after move-in date
            },
          },
          {
            OR: [
              { num_beds: { in: userFilter.num_beds } }, // Matches beds filter
              { num_beds: null }, // Allow null if bed count isn't specified
            ],
          },
          {
            OR: [
              { num_baths: { in: userFilter.num_baths } }, // Matches baths filter
              { num_baths: null }, // Allow null if bath count isn't specified
            ],
          },
          {
            OR: [
              { parking: { in: userFilter.num_parking } }, // Matches parking filter
              { parking: null }, // Allow null if parking isn't specified
            ],
          },
          {
            furnished: userFilter.furnished, // Matches furnished preference
          },
          {
            pets: userFilter.pets, // Matches pet allowance preference
          },
        ],
      },
      include: {
        listing: true, // Include associated listing details
      },
    });

    return listings;
  } catch (error) {
    console.error("Error fetching filtered listings:", error);
    throw new Error("Error fetching filtered listings");
  }
}

export async function getAllFilteredListings(userFilter: any) {
  try {
    const listings = await prisma.listingParameters.findMany({
      where: {
        AND: [
          {
            price: {
              lte: userFilter.price_limit, // Price <= user's limit
            },
          },
          {
            availability: {
              gte: userFilter.move_in_date, // Available after move-in date
            },
          },
          {
            OR: [
              { num_beds: { in: userFilter.num_beds } }, // Matches beds filter
              { num_beds: null }, // Allow null if bed count isn't specified
            ],
          },
          {
            OR: [
              { num_baths: { in: userFilter.num_baths } }, // Matches baths filter
              { num_baths: null }, // Allow null if bath count isn't specified
            ],
          },
          {
            OR: [
              { parking: { in: userFilter.num_parking } }, // Matches parking filter
              { parking: null }, // Allow null if parking isn't specified
            ],
          },
          {
            furnished: userFilter.furnished, // Matches furnished preference
          },
          {
            pets: userFilter.pets, // Matches pet allowance preference
          },
        ],
      },
      include: {
        listing: true, // Include associated listing details
      },
    });

    return listings;
  } catch (error) {
    console.error("Error fetching filtered listings:", error);
    throw new Error("Error fetching filtered listings");
  }
}

// Initialize the SES client
const ses = new AWS.SES({ region: "us-west-2" });

/**
 * Sends an email via AWS SES.
 * @param {string} toEmail - Recipient email address.
 * @param {string} subject - Subject of the email.
 * @param {string} body - Body content of the email.
 */
export async function sendEmail(
  toEmail: string,
  subject: string,
  body: string
): Promise<void> {
  // Construct email parameters
  const params = {
    Destination: {
      ToAddresses: [toEmail], // Recipient email address
    },
    Message: {
      Body: {
        Html: { Data: body }, // You can use Html or Text based on the email type
        Text: { Data: body }, // Plain-text version of the body
      },
      Subject: { Data: subject }, // Email subject
    },
    Source: "newsletter@rental-insight.com", // Sender's verified email
  };

  try {
    // Send email via SES
    await ses.sendEmail(params).promise();
    console.log(`Email sent to ${toEmail} successfully.`);
  } catch (err) {
    console.error(`Failed to send email to ${toEmail}:`, err);
    if (err instanceof Error) {
      throw new Error(`Email send failed: ${err.message}`);
    }
  }
}
