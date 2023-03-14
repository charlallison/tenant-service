import {formatJSONResponse, ValidatedEventAPIGatewayProxyEvent} from "@libs/api-gateway";
import {middyfy} from "@libs/lambda";
import schema from "./schema";
import {ScanCommand} from "@aws-sdk/client-dynamodb";
import {unmarshall} from "@aws-sdk/util-dynamodb";
import {ddbClient} from "@libs/aws-client";

// @ts-ignore
const handler: ValidatedEventAPIGatewayProxyEvent<typeof schema> = async (event) => {
  const result = await ddbClient.send(new ScanCommand({
    TableName: process.env.TENANT_TABLE_NAME,
    ProjectionExpression: 'id, #name',
    ExpressionAttributeNames: {
      '#name': 'name'
    }
  }));

  const tenants = result.Items.map(item => unmarshall(item));

  return formatJSONResponse({tenants})
}

export const main = middyfy(handler);