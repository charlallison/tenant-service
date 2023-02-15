import type { ValidatedEventAPIGatewayProxyEvent } from "../../src/libs/api-gateway";
import { formatJSONResponse } from "../../src/libs/api-gateway";
import { middyfy } from "../../src/libs/lambda";
import {DynamoDBClient, PutItemCommand} from "@aws-sdk/client-dynamodb";
import {marshall} from "@aws-sdk/util-dynamodb";
import schema from "./schema";

const dynamoDBClient = new DynamoDBClient({
  region: process.env.REGION
})

const handler: ValidatedEventAPIGatewayProxyEvent<typeof schema> = async (event) => {
  // extract fields from body
  const { name, phone } = event.body;

  // save tenant to database
  await dynamoDBClient.send(new PutItemCommand({
    Item: marshall({ name, phone }),
    TableName: process.env.TENANT_TABLE_NAME
  }));

  return formatJSONResponse({
    message: `Tenant created successfully`
  });
};

export const main = middyfy(handler);