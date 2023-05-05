import {
  formatJSONResponse, ValidatedEventAPIGatewayProxyEvent
} from "@libs/api-gateway";
import schema from "./schema";
import {middyfy} from "@libs/lambda";
import {UpdateItemCommand} from "@aws-sdk/client-dynamodb";
import {marshall} from "@aws-sdk/util-dynamodb";
import {ddbClient} from "@libs/aws-client";
import {Tenant, TenantStatus} from "@models/tenant";
import {getTenantById} from "../util-tenant";
import {NotFound} from "http-errors";

const handler: ValidatedEventAPIGatewayProxyEvent<typeof schema> = async (event) => {
  const { id } = event.pathParameters;

  const tenant = await getTenantById(id);

  if (!tenant) {
    const { message, statusCode } = new NotFound(`Tenant not found`);
    return formatJSONResponse({message}, statusCode);
  }

  await ddbClient.send(new UpdateItemCommand({
    Key: marshall(Tenant.BuildKeys(id)),
    TableName: process.env.TENANT_TABLE_NAME,
    UpdateExpression: 'SET #status = :status',
    ExpressionAttributeValues: {
      // @ts-ignore
      ':status': marshall(TenantStatus.NotActive),
    },
    ExpressionAttributeNames: {
      '#status': 'status'
    }
  }));

  return formatJSONResponse({
    message: `Tenant deleted`
  });
}

export const main = middyfy(handler, schema);