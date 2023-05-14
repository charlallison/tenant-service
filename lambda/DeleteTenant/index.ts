import {
  formatJSONResponse, ValidatedEventAPIGatewayProxyEvent
} from "@libs/api-gateway";
import schema from "./schema";
import {middyfy} from "@libs/lambda";
import {ddbDocClient} from "@libs/aws-client";
import {Tenant, TenantStatus} from "@models/tenant";
import {getTenantById} from "../util-tenant";
import {NotFound} from "http-errors";
import {UpdateCommand} from "@aws-sdk/lib-dynamodb";

const handler: ValidatedEventAPIGatewayProxyEvent<typeof schema> = async (event) => {
  const { id } = event.pathParameters;

  const tenant = await getTenantById(id);

  if (!tenant) {
    const { message, statusCode } = new NotFound(`Tenant not found`);
    return formatJSONResponse({ message }, statusCode);
  }

  await ddbDocClient.send(new UpdateCommand({
    Key: Tenant.BuildPK(id),
    TableName: process.env.TENANT_TABLE_NAME,
    UpdateExpression: 'SET #status = :status',
    ExpressionAttributeValues: {
      ':status': TenantStatus.InActive,
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