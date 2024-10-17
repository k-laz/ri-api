import { Listing, prisma } from "../models/index.js";
import nodemailer from "nodemailer";
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
async function sendEmail(
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

// // Create the transporter using nodemailer
// const transporter = nodemailer.createTransport({
//   service: "gmail", // For Gmail; use 'smtp' if you're using another email provider
//   auth: {
//     user: process.env.EMAIL_USER, // Your email address
//     pass: process.env.EMAIL_PASS, // Your email password or app-specific password
//   },
// });

// /**
//  * Sends an email to a recipient.
//  *
//  * @param recipient - The email address of the recipient
//  * @param subject - The subject of the email
//  * @param content - The content/body of the email
//  */
// export const sendEmail = async (
//   recipient: string,
//   subject: string,
//   content: string
// ): Promise<void> => {
//   try {
//     const mailOptions = {
//       from: process.env.EMAIL_USER, // Sender address
//       to: recipient, // Recipient address
//       subject: subject, // Subject of the email
//       text: content, // Plain text body
//     };

//     // Send the email
//     await transporter.sendMail(mailOptions);
//     console.log(`Email sent successfully to ${recipient}`);
//   } catch (error) {
//     console.error("Error sending email:", error);
//     throw new Error("Failed to send email.");
//   }
// };
