import {formatJSONResponse, ValidatedEventAPIGatewayProxyEvent} from "@libs/api-gateway";
import schema from "./schema";
import {middyfy} from "@libs/lambda";
import {ddbDocClient} from "@libs/aws-client";
import {Tenant} from "@models/tenant";
import {UpdateCommand} from "@aws-sdk/lib-dynamodb";
import {InternalServerError} from "http-errors";

const handler: ValidatedEventAPIGatewayProxyEvent<typeof schema> = async (event) => {
  const { id } = event.pathParameters;
  const { name }: { [key: string]: any } = event.body;

  try {
    const item = await ddbDocClient.send(new UpdateCommand({
      Key: Tenant.BuildPK(id),
      TableName: process.env.TENANT_TABLE_NAME,
      UpdateExpression: 'SET #name = :name',
      ConditionExpression: 'attribute_exists(id)',
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
  }catch (e) {
    const { message, statusCode } = new InternalServerError(`Update tenant failed`);
    return formatJSONResponse({ message }, statusCode);
  }
};

export const main = middyfy(handler, schema);