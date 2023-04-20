import {formatJSONResponse, ValidatedEventAPIGatewayProxyEvent} from "@libs/api-gateway";
import {middyfy} from "@libs/lambda";
import schema from "./schema";
import {QueryCommand} from "@aws-sdk/client-dynamodb";
import {marshall, unmarshall} from "@aws-sdk/util-dynamodb";
import {ddbClient} from "@libs/aws-client";

// @ts-ignore
const handler: ValidatedEventAPIGatewayProxyEvent<typeof schema> = async (event) => {
  const { status } = event.queryStringParameters;

  const result = await ddbClient.send(new QueryCommand({
    TableName: process.env.TENANT_TABLE_NAME,
    IndexName: 'StatusIndex',
    KeyConditionExpression: '#status = :status',
    ExpressionAttributeNames: {
      '#status': 'status',
      '#name': 'name'
    },
    ExpressionAttributeValues: {
      // @ts-ignore
      ':status': marshall(status)
    },
    ProjectionExpression: 'id, email, #name'
  }));

  const tenants = result.Items.map(item => unmarshall(item));

  return formatJSONResponse({ tenants });
}

export const main = middyfy(handler, schema);