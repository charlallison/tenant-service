import {DynamoDBClient} from "@aws-sdk/client-dynamodb";

export const dynamoDBClient = new DynamoDBClient({
  region: process.env.REGION
})

