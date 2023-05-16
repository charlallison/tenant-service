import type {ValidatedEventAPIGatewayProxyEvent} from "@libs/api-gateway";
import {formatJSONResponse} from "@libs/api-gateway";
import {middyfy} from "@libs/lambda";
import schema from "./schema";
import {ddbDocClient} from "@libs/aws-client";
import {Tenant} from "@models/tenant";
import {InternalServerError} from "http-errors";
import {PutCommand} from "@aws-sdk/lib-dynamodb";

const handler: ValidatedEventAPIGatewayProxyEvent<typeof schema> = async (event) => {
  const { phone, name }: { [key: string]: any } = event.body;

  const tenant = new Tenant({ name, phone });

  try {
    await ddbDocClient.send(new PutCommand({
      Item: tenant,
      ConditionExpression: 'attribute_not_exists(phone)',
      TableName: process.env.TENANT_TABLE_NAME
    }));

    return formatJSONResponse({
      message: `Tenant created`,
      tenant
    }, 201);
  }catch (e) {
    const { message, statusCode } = new InternalServerError(`Create tenant failed`);
    return formatJSONResponse({ e, message }, statusCode);
  }
};

export const main = middyfy(handler, schema);