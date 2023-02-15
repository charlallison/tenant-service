import {formatJSONResponse, ValidatedEventAPIGatewayProxyEvent} from "../../src/libs/api-gateway";
import {middyfy} from "../../src/libs/lambda";
import schema from "./schema";
import {DynamoDBClient, ScanCommand} from "@aws-sdk/client-dynamodb";
import {unmarshall} from "@aws-sdk/util-dynamodb";

const dynamodbClient = new DynamoDBClient({
  region: process.env.REGION
})

// @ts-ignore
const handler: ValidatedEventAPIGatewayProxyEvent<typeof schema> = async (event) => {
  const result = await dynamodbClient.send(new ScanCommand({
    TableName: process.env.TENANT_TABLE_NAME
  }));

  const tenants = result.Items.map(item => unmarshall(item));

  return formatJSONResponse({tenants})
}

export const main = middyfy(handler);