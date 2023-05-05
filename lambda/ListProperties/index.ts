import {
  formatJSONResponse, ValidatedEventAPIGatewayProxyEvent
} from "@libs/api-gateway";
import schema from "./schema";
import {middyfy} from "@libs/lambda";
import {ddbClient} from "@libs/aws-client";
import {QueryCommand} from "@aws-sdk/client-dynamodb";
import {marshall, unmarshall} from "@aws-sdk/util-dynamodb";
import {Property} from "@models/property";

const handler:ValidatedEventAPIGatewayProxyEvent<typeof schema> = async (event) => {
  const { status }: { [key: string]: any } = event.queryStringParameters;

  const result = await ddbClient.send(new QueryCommand({
    TableName: process.env.TENANT_TABLE_NAME,
    IndexName: 'StatusIndex',
    KeyConditionExpression: '#status = :status',
    FilterExpression: '#type = :type',
    ExpressionAttributeValues: {
      // @ts-ignore
      ':status': marshall(status),
      // @ts-ignore
      ':type': marshall(Property.name)
    },
    ExpressionAttributeNames: {
      '#status': 'status',
      '#type': 'Type'
    },
    ProjectionExpression: `id, city, address`
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