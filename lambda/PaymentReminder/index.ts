import {ValidatedEventAPIGatewayProxyEvent} from "../../src/libs/api-gateway";
import schema from "./schema";
import {DynamoDBClient, QueryCommand} from "@aws-sdk/client-dynamodb";
import {DateTime} from "luxon";
import {InternalServerError} from "http-errors";
import {marshall} from "@aws-sdk/util-dynamodb";
import {AttributeValue} from "aws-lambda";

const dynamodbClient = new DynamoDBClient({
  region: process.env.REGION
})

export const main: ValidatedEventAPIGatewayProxyEvent<typeof schema> = async (event) => {
  const currentUnixStamp = DateTime.now().toUnixInteger();


  try {
    await dynamodbClient.send(new QueryCommand({
      TableName: process.env.TENANT_TABLE_NAME,
      IndexName: 'payments',
      KeyConditionExpression: 'expiresOn - :currentDate <= :lower AND expiresOn - :upper >=',
      ExpressionAttributeValues: {
        ':currentDate': {
          'N': currentUnixStamp.toString()
        },
        ':lower': {
          N: "2505600"
        },
        ':upper': {
          N: '2678400'
        }
      }
    }));
  }catch (e) {
    console.error(e);
    throw new InternalServerError();
  }



}