import {
  formatJSONResponse, ValidatedEventAPIGatewayProxyEvent
} from "@libs/api-gateway";
import schema from "./schema";
import {middyfy} from "@libs/lambda";
import {ddbDocClient} from "@libs/aws-client";
import {GSIs} from "../gsi-index";
import {Property} from "@models/property";
import { QueryCommand } from "@aws-sdk/lib-dynamodb";

const handler:ValidatedEventAPIGatewayProxyEvent<typeof schema> = async (event) => {
  const { status }: { [key: string]: any } = event.queryStringParameters;
  const gsi1key = Property.BuildGSIKey(status);

  const result = await ddbDocClient.send(new QueryCommand({
    TableName: process.env.TENANT_TABLE_NAME,
    IndexName: GSIs.GSI1,
    KeyConditionExpression: 'GSI1PK = :gsi1pk',
    ExpressionAttributeValues: {
      ':gsi1pk': gsi1key,
    },
    ProjectionExpression: `id, city, address`
  }));

  if(result.Items.length == 0) {
    return formatJSONResponse({message: 'No properties found'});
  }

  const properties = result.Items.map(item => item as Property);

  return formatJSONResponse({
    properties
  })
}

export const main = middyfy(handler, schema);