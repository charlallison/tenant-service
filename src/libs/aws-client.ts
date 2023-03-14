import {DynamoDBClient} from "@aws-sdk/client-dynamodb";
import {SNSClient} from "@aws-sdk/client-sns";

const ddbClient = new DynamoDBClient({
  region: process.env.REGION
})

const snsClient = new SNSClient({
  region: process.env.REGION
});

export {
  ddbClient, snsClient
}