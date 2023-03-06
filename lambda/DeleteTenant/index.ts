import {formatJSONResponse, ValidatedEventAPIGatewayProxyEvent} from "../../src/libs/api-gateway";
import schema from "./schema";
import {middyfy} from "../../src/libs/lambda";
import {InternalServerError, NotFound} from "http-errors";
import {DeleteItemCommand, GetItemCommand} from "@aws-sdk/client-dynamodb";
import {marshall} from "@aws-sdk/util-dynamodb";
import {dynamoDBClient} from "../../src/libs/dynamodb-client";

const handler: ValidatedEventAPIGatewayProxyEvent<typeof schema> = async (event) => {
  const { id } = event.pathParameters;

  if(!id) {
    throw new InternalServerError();
  }

  const result = await dynamoDBClient.send(new GetItemCommand({
    Key: marshall({ id }),
    TableName: process.env.TENANT_TABLE_NAME
  }))

  if(!result.Item) {
    throw new NotFound();
  }

  await dynamoDBClient.send(new DeleteItemCommand({
    Key: marshall({ id }),
    TableName: process.env.TENANT_TABLE_NAME,
  }));

  return formatJSONResponse({
    message: `Tenant deleted successfully`
  });
}

export const main = middyfy(handler);