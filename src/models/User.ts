// userModel.ts
import { QueryCommand, PutItemCommand } from "@aws-sdk/client-dynamodb";
import dynamodbClient from "../dynamodbClient.js";
import { v4 as uuidv4 } from "uuid";

const TABLE_NAME = "YourTableName";

export interface UserFilter {
  price_limit: number;
  move_in_date: string;
  num_baths: number[];
  num_beds: number[];
  num_parking: number[];
  furnished: boolean;
  pets: boolean;
  gender_preference: string[];
}

export interface User {
  firebaseUId: string;
  email: string;
  role: string;
  filters: UserFilter;
}

// Get a user and their filter preferences
export const getUserWithFilters = async (
  firebaseUId: string
): Promise<User | null> => {
  const command = new QueryCommand({
    TableName: TABLE_NAME,
    KeyConditionExpression: "PK = :pk AND SK = :sk",
    ExpressionAttributeValues: {
      ":pk": { S: `USER#${firebaseUId}` },
      ":sk": { S: "METADATA" },
    },
  });

  try {
    const result = await dynamodbClient.send(command);
    return result.Items?.[0] as User; // Assuming the first item is the user metadata with filters
  } catch (error) {
    console.error("Error fetching user:", error);
    return null;
  }
};

// Create or update a user
export const putUser = async (userData: User): Promise<void> => {
  const userId = uuidv4(); // If you don't already have an ID for users
  const command = new PutItemCommand({
    TableName: TABLE_NAME,
    Item: {
      PK: { S: `USER#${userData.firebaseUId}` },
      SK: { S: "METADATA" },
      id: { S: userId },
      email: { S: userData.email },
      role: { S: userData.role },
      filters: {
        M: {
          price_limit: { N: userData.filters.price_limit.toString() },
          move_in_date: { S: userData.filters.move_in_date },
          num_baths: { NS: userData.filters.num_baths.map(String) },
          num_beds: { NS: userData.filters.num_beds.map(String) },
          num_parking: { NS: userData.filters.num_parking.map(String) },
          furnished: { BOOL: userData.filters.furnished },
          pets: { BOOL: userData.filters.pets },
          gender_preference: { SS: userData.filters.gender_preference },
        },
      },
    },
  });

  try {
    await dynamodbClient.send(command);
    console.log("User inserted/updated successfully");
  } catch (error) {
    console.error("Error inserting/updating user:", error);
    throw new Error("Error inserting/updating user");
  }
};
