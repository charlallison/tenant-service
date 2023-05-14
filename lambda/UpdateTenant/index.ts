import {formatJSONResponse, ValidatedEventAPIGatewayProxyEvent} from "@libs/api-gateway";
import schema from "./schema";
import {middyfy} from "@libs/lambda";
import {NotFound} from "http-errors";
import {ddbDocClient} from "@libs/aws-client";
import {Tenant} from "@models/tenant";
import {getTenantById} from "../util-tenant";
import {UpdateCommand} from "@aws-sdk/lib-dynamodb";

const handler: ValidatedEventAPIGatewayProxyEvent<typeof schema> = async (event) => {
  const { id } = event.pathParameters;
  const { name }: { [key: string]: any } = event.body;

  const tenant = await getTenantById(id);

  if (!tenant) {
    const {message, statusCode } = new NotFound(`Tenant not found`);
    return formatJSONResponse({ message }, statusCode);
  }

  const item = await ddbDocClient.send(new UpdateCommand({
    Key: Tenant.BuildPK(id),
    TableName: process.env.TENANT_TABLE_NAME,
    UpdateExpression: 'SET #name = :name',
    ExpressionAttributeValues: {
      ':name': name,
    },
    ExpressionAttributeNames: {
      '#name': 'name'
    },
    ReturnValues: 'ALL_NEW',
  }));

  return formatJSONResponse({
    message: `Tenant updated!`,
    tenant: item.Attributes
  });
};

export const main = middyfy(handler, schema);