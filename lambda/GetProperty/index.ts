import {formatJSONResponse, ValidatedEventAPIGatewayProxyEvent} from "@libs/api-gateway";
import schema from "./schema";
import {middyfy} from "@libs/lambda";
import {ddbClient} from "@libs/aws-client";
import {GetItemCommand} from "@aws-sdk/client-dynamodb";
import {marshall, unmarshall} from "@aws-sdk/util-dynamodb";
import {NotFound} from "http-errors";
import {Property} from "@models/property";

const handler: ValidatedEventAPIGatewayProxyEvent<typeof schema> = async (event) => {
  const { id } = event.pathParameters;

  const response = await ddbClient.send(new GetItemCommand({
    TableName: process.env.TENANT_TABLE_NAME,
    Key: marshall(Property.BuildKeys(id))
  }));

  if (!response.Item) {
    const { message, statusCode } = new NotFound(`Property not found`)
    return formatJSONResponse({message}, statusCode)
  }

  return formatJSONResponse({
    property: unmarshall(response.Item)
  })
}

export const main = middyfy(handler, schema);