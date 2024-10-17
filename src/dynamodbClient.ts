// dynamodbClient.ts
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";

const dynamodbClient = new DynamoDBClient({ region: "your-region" });

export default dynamodbClient;
