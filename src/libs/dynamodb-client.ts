import {DynamoDBClient} from "@aws-sdk/client-dynamodb";

export const ddbClient = new DynamoDBClient({
  region: process.env.REGION
})

