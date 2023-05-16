import {
  formatJSONResponse, ValidatedEventAPIGatewayProxyEvent
} from "@libs/api-gateway";
import schema from "./schema";
import {middyfy} from "@libs/lambda";
import {ddbDocClient} from "@libs/aws-client";
import {Tenant, TenantStatus} from "@models/tenant";
import {InternalServerError} from "http-errors";
import {UpdateCommand} from "@aws-sdk/lib-dynamodb";

const handler: ValidatedEventAPIGatewayProxyEvent<typeof schema> = async (event) => {
  const { id } = event.pathParameters;

  try {
    await ddbDocClient.send(new UpdateCommand({
      Key: Tenant.BuildPK(id),
      TableName: process.env.TENANT_TABLE_NAME,
      UpdateExpression: 'SET #status = :status',
      ConditionExpression: 'attribute_exists(id)',
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
  }catch (e) {
    const { message, statusCode } = new InternalServerError(`Delete tenant failed`);
    return formatJSONResponse({ message }, statusCode);
  }
}

export const main = middyfy(handler, schema);