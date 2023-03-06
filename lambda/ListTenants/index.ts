import {formatJSONResponse, ValidatedEventAPIGatewayProxyEvent} from "../../src/libs/api-gateway";
import {middyfy} from "../../src/libs/lambda";
import schema from "./schema";
import {ScanCommand} from "@aws-sdk/client-dynamodb";
import {unmarshall} from "@aws-sdk/util-dynamodb";
import {dynamoDBClient} from "../../src/libs/dynamodb-client";

// @ts-ignore
const handler: ValidatedEventAPIGatewayProxyEvent<typeof schema> = async (event) => {
  const result = await dynamoDBClient.send(new ScanCommand({
    TableName: process.env.TENANT_TABLE_NAME,
    ProjectionExpression: '#id, #name'
  }));

  const tenants = result.Items.map(item => unmarshall(item));

  return formatJSONResponse({tenants})
}

export const main = middyfy(handler);