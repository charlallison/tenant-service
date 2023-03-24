import {
  formatJSONResponse,
  ValidatedEventAPIGatewayProxyEventPathParameters
} from "@libs/api-gateway";
import schema from "./schema";
import {middyfy} from "@libs/lambda";
import {NotFound} from "http-errors";
import {DeleteItemCommand, GetItemCommand} from "@aws-sdk/client-dynamodb";
import {marshall} from "@aws-sdk/util-dynamodb";
import {ddbClient} from "@libs/aws-client";
import * as console from "console";

const handler: ValidatedEventAPIGatewayProxyEventPathParameters<typeof schema> = async (event) => {
  const { id } = event.pathParameters;

  try {
    const result = await ddbClient.send(new GetItemCommand({
      Key: marshall({ id }),
      TableName: process.env.TENANT_TABLE_NAME
    }));

    if(!result.Item) {
      const { message, statusCode } = new NotFound(`Tenant not found, please try again.`);
      console.error(message, id);
      return formatJSONResponse({ message }, statusCode);
    }

    await ddbClient.send(new DeleteItemCommand({
      Key: marshall({ id }),
      TableName: process.env.TENANT_TABLE_NAME,
    }));

    return formatJSONResponse({
      message: `Tenant deleted successfully`
    });
  }catch (e) {
    console.error(e);
    return formatJSONResponse({ message: e.message}, 500)
  }
}

export const main = middyfy(handler);