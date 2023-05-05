import type {ValidatedEventAPIGatewayProxyEvent} from "@libs/api-gateway";
import {formatJSONResponse} from "@libs/api-gateway";
import {middyfy} from "@libs/lambda";
import {PutItemCommand} from "@aws-sdk/client-dynamodb";
import {marshall} from "@aws-sdk/util-dynamodb";
import schema from "./schema";
import {ddbClient} from "@libs/aws-client";
import {Tenant} from "@models/tenant";
import {getTenantByPhone} from "../util-tenant";
import {BadRequest} from "http-errors";

const handler: ValidatedEventAPIGatewayProxyEvent<typeof schema> = async (event) => {
  const { phone, name }: { [key: string]: any } = event.body;

  const response = await getTenantByPhone(phone);
  if(response.Items.length > 0) {
    const {message, statusCode} = new BadRequest(`Tenant already exists`);
    return formatJSONResponse({ message }, statusCode)
  }

  const tenant = new Tenant({ name, phone });

  await ddbClient.send(new PutItemCommand({
    Item: marshall(tenant, {convertClassInstanceToMap: true}),
    TableName: process.env.TENANT_TABLE_NAME
  }));

  return formatJSONResponse({
    message: `Tenant created successfully`,
    tenant
  }, 201);
};

export const main = middyfy(handler, schema);