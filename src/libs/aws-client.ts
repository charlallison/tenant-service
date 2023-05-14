import {DynamoDBClient} from "@aws-sdk/client-dynamodb";
import {SNSClient} from "@aws-sdk/client-sns";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({
  region: process.env.REGION
})
const ddbDocClient = DynamoDBDocumentClient.from(client, {
  marshallOptions: {
    convertClassInstanceToMap: true
  }
});

const snsClient = new SNSClient({
  region: process.env.REGION
});

export {
  ddbDocClient, snsClient
}