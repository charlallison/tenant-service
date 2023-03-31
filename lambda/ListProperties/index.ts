import {
  formatJSONResponse,
  ValidatedEventAPIGatewayProxyEventQueryParameters
} from "@libs/api-gateway";
import schema from "./schema";
import {middyfy} from "@libs/lambda";
import {ddbClient} from "@libs/aws-client";
import {QueryCommand} from "@aws-sdk/client-dynamodb";
import {marshall, unmarshall} from "@aws-sdk/util-dynamodb";

const handler:ValidatedEventAPIGatewayProxyEventQueryParameters<typeof schema> = async (event) => {
  const { status } = event.queryStringParameters;

  const result = await ddbClient.send(new QueryCommand({
    TableName: process.env.TENANT_TABLE_NAME,
    IndexName: 'PropertyStatus',
    KeyConditionExpression: '#status = :status',
    ExpressionAttributeValues: {
      // @ts-ignore
      ":status": marshall(status)
    },
    ExpressionAttributeNames: {
      '#status': 'status'
    },
    ProjectionExpression: `id, title, description`
  }));

  if(result.Items.length == 0) {
    return formatJSONResponse({message: 'No properties found'});
  }

  const properties = result.Items.map(item => unmarshall(item));

  return formatJSONResponse({
    properties
  })
}

export const main = middyfy(handler, schema);