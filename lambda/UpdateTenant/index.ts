import {GetItemCommand, UpdateItemCommand} from "@aws-sdk/client-dynamodb";
import {formatJSONResponse, ValidatedEventAPIGatewayProxyEvent} from "@libs/api-gateway";
import schema from "./schema";
import {middyfy} from "@libs/lambda";
import {marshall, unmarshall} from "@aws-sdk/util-dynamodb";
import {NotFound} from "http-errors";
import {ddbClient} from "@libs/aws-client";
import {Tenant} from "@models/tenant";

const handler: ValidatedEventAPIGatewayProxyEvent<typeof schema> = async (event) => {
  const { id } = event.pathParameters;
  const { name} = event.body;

  const tenant = await ddbClient.send(new GetItemCommand({
    Key: marshall(Tenant.BuildKeys(id)),
    TableName: process.env.TENANT_TABLE_NAME,
  }));

  if (!tenant.Item) {
    const {message, statusCode } = new NotFound(`Tenant not found`);
    return formatJSONResponse({message}, statusCode)
  }

  const item = await ddbClient.send(new UpdateItemCommand({
    Key: marshall(Tenant.BuildKeys(id)),
    TableName: process.env.TENANT_TABLE_NAME,
    UpdateExpression: 'SET #name = :name',
    ExpressionAttributeValues: {
      // @ts-ignore
      ':name': marshall(name),
    },
    ExpressionAttributeNames: {
      '#name': 'name'
    },
    ReturnValues: 'ALL_NEW',
  }));

  return formatJSONResponse({
    message: `Tenant updated!`,
    tenant: unmarshall(item.Attributes)
  });
};

export const main = middyfy(handler, schema);