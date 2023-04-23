import {
  formatJSONResponse, ValidatedEventAPIGatewayProxyEvent
} from "@libs/api-gateway";
import schema from "./schema";
import {middyfy} from "@libs/lambda";
import {DeleteItemCommand, GetItemCommand} from "@aws-sdk/client-dynamodb";
import {marshall} from "@aws-sdk/util-dynamodb";
import {ddbClient} from "@libs/aws-client";
import {Tenant} from "@models/tenant";
import {NotFound} from "http-errors";

const handler: ValidatedEventAPIGatewayProxyEvent<typeof schema> = async (event) => {
  const { id } = event.pathParameters;
  // @ts-ignore
  const pk = Tenant.BuildKeys(id);

  const result = await ddbClient.send(new GetItemCommand({
    Key: marshall(pk),
    TableName: process.env.TENANT_TABLE_NAME
  }));

  if(!result.Item) {
    const { message, statusCode } = new NotFound(`Tenant not found.`);
    return formatJSONResponse({ message }, statusCode);
  }

  await ddbClient.send(new DeleteItemCommand({
    // @ts-ignore
    Key: marshall(pk),
    TableName: process.env.TENANT_TABLE_NAME,
  }));

  return formatJSONResponse({
    message: `Tenant deleted`
  });
}

export const main = middyfy(handler, schema);