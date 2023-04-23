import {formatJSONResponse, ValidatedEventAPIGatewayProxyEvent} from "@libs/api-gateway";
import schema from "./schema";
import {middyfy} from "@libs/lambda";
import {GetItemCommand} from "@aws-sdk/client-dynamodb";
import {marshall, unmarshall} from "@aws-sdk/util-dynamodb";
import {NotFound} from "http-errors";
import {ddbClient} from "@libs/aws-client";
import {Tenant} from "@models/tenant";

const handler: ValidatedEventAPIGatewayProxyEvent<typeof schema> = async (event) => {
  const { id} = event.pathParameters;

  const result = await ddbClient.send(new GetItemCommand({
    // @ts-ignore
    Key: marshall(Tenant.BuildKeys(id)),
    TableName: process.env.TENANT_TABLE_NAME,
    ConsistentRead: true
  }))

  if(!result.Item) {
    const {message, statusCode} = new NotFound(`Tenant not found`);
    return formatJSONResponse({message}, statusCode)
  }

  return formatJSONResponse({
    tenant: unmarshall(result.Item)
  });
}

export const main = middyfy(handler, schema)