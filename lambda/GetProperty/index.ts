import {formatJSONResponse, ValidatedEventAPIGatewayProxyEvent} from "@libs/api-gateway";
import schema from "./schema";
import {middyfy} from "@libs/lambda";
import {ddbDocClient} from "@libs/aws-client";
import {NotFound} from "http-errors";
import {Property} from "@models/property";
import {GetCommand} from "@aws-sdk/lib-dynamodb";

const handler: ValidatedEventAPIGatewayProxyEvent<typeof schema> = async (event) => {
  const { id } = event.pathParameters;

  const response = await ddbDocClient.send(new GetCommand({
    TableName: process.env.TENANT_TABLE_NAME,
    Key: Property.BuildPK(id)
  }));

  if (!response.Item) {
    const { message, statusCode } = new NotFound(`Property not found`)
    return formatJSONResponse({message}, statusCode)
  }

  return formatJSONResponse({
    ...response.Item
  })
}

export const main = middyfy(handler, schema);