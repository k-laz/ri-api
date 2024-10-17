// listingModel.ts
import { QueryCommand, PutItemCommand } from "@aws-sdk/client-dynamodb";
import dynamodbClient from "../dynamodbClient.js";
import { v4 as uuidv4 } from "uuid";
import { UserFilter } from "./User.js";

const TABLE_NAME = "YourTableName";

export interface ListingParameters {
  price: number;
  availability: string;
  num_beds?: number;
  num_baths?: number;
  parking?: number;
  furnished?: boolean;
  pets?: boolean;
}

export interface Listing {
  link: string;
  hash: string;
  title: string;
  pub_date: string;
  isSent?: boolean;
  listingParameters: ListingParameters;
}

// Insert or update a listing
export const putListing = async (listingData: Listing): Promise<void> => {
  const listingId = uuidv4(); // Generate a unique ID for the listing
  const command = new PutItemCommand({
    TableName: TABLE_NAME,
    Item: {
      PK: { S: `LISTING#${listingId}` },
      SK: { S: "METADATA" },
      id: { S: listingId },
      link: { S: listingData.link },
      hash: { S: listingData.hash },
      title: { S: listingData.title },
      pub_date: { S: listingData.pub_date },
      isSent: { BOOL: listingData.isSent || false },
      listingParameters: {
        M: {
          price: { N: listingData.listingParameters.price.toString() },
          availability: { S: listingData.listingParameters.availability },
          num_beds: {
            N: listingData.listingParameters.num_beds?.toString() || "0",
          },
          num_baths: {
            N: listingData.listingParameters.num_baths?.toString() || "0",
          },
          parking: {
            N: listingData.listingParameters.parking?.toString() || "0",
          },
          furnished: { BOOL: listingData.listingParameters.furnished || false },
          pets: { BOOL: listingData.listingParameters.pets || false },
        },
      },
    },
  });

  try {
    await dynamodbClient.send(command);
    console.log("Listing inserted/updated successfully");
  } catch (error) {
    console.error("Error inserting/updating listing:", error);
    throw new Error("Error inserting/updating listing");
  }
};

// Query listings based on user filters
export const queryListingsByFilters = async (
  filters: UserFilter
): Promise<Listing[] | null> => {
  const command = new QueryCommand({
    TableName: TABLE_NAME,
    IndexName: "GSI1", // Assuming you have a GSI on `price`
    KeyConditionExpression: "#price <= :priceLimit",
    FilterExpression:
      "#num_beds = :numBeds AND #num_baths = :numBaths AND #pets = :petsAllowed",
    ExpressionAttributeNames: {
      "#price": "price",
      "#num_beds": "num_beds",
      "#num_baths": "num_baths",
      "#pets": "pets",
    },
    ExpressionAttributeValues: {
      ":priceLimit": { N: filters.price_limit.toString() },
      ":numBeds": { N: filters.num_beds[0].toString() }, // Simplified for this example
      ":numBaths": { N: filters.num_baths[0].toString() },
      ":petsAllowed": { BOOL: filters.pets },
    },
  });

  try {
    const result = await dynamodbClient.send(command);
    return result.Items as Listing[];
  } catch (error) {
    console.error("Error querying listings:", error);
    return null;
  }
};
