import type {ValidatedEventAPIGatewayProxyEvent} from "@libs/api-gateway";
import {formatJSONResponse} from "@libs/api-gateway";
import {middyfy} from "@libs/lambda";
import {PutItemCommand} from "@aws-sdk/client-dynamodb";
import {marshall} from "@aws-sdk/util-dynamodb";
import schema from "./schema";
import {ddbClient} from "@libs/aws-client";
import {Tenant} from "@models/tenant";

const handler: ValidatedEventAPIGatewayProxyEvent<typeof schema> = async (event) => {
  const { name, phone, email } = event.body;

  // @ts-ignore
  const tenant = new Tenant({ name, phone, email });

  await ddbClient.send(new PutItemCommand({
    Item: marshall(tenant, {convertClassInstanceToMap: true}),
    TableName: process.env.TENANT_TABLE_NAME
  }));

  return formatJSONResponse({
    message: `Tenant created successfully`,
    tenant
  });
};

export const main = middyfy(handler, schema);