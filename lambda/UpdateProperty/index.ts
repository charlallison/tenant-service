import {formatJSONResponse, ValidatedEventAPIGatewayProxyEvent} from "@libs/api-gateway";
import schema from "./schema";
import {middyfy} from "@libs/lambda";
import {ddbDocClient} from "@libs/aws-client";
import {Property} from "@models/property";
import { ReturnValue } from "@aws-sdk/client-dynamodb";
import { UpdateCommand } from "@aws-sdk/lib-dynamodb";
import {BadRequest} from "http-errors";

const handler: ValidatedEventAPIGatewayProxyEvent<typeof schema> = async (event) => {
  const { id } = event.pathParameters;
  const { cost, rooms }: { [key: string]: any } = event.body;

  try {
    const response = await ddbDocClient.send(new UpdateCommand({
      TableName: process.env.TENANT_TABLE_NAME,
      Key: Property.BuildPK(id),
      UpdateExpression: `SET cost = :cost, rooms = :rooms`,
      ConditionExpression: 'attribute_exists(id)',
      ExpressionAttributeValues: {
        ':cost': cost,
        ':rooms': rooms
      },
      ReturnValues: ReturnValue.ALL_NEW
    }));

    return formatJSONResponse({
      message: `Property updated!`,
      property: response.Attributes
    });
  }catch (e) {
    const { message, statusCode } = new BadRequest(`Update property failed`);
    return formatJSONResponse({ message }, statusCode);
  }

}

export const main = middyfy(handler, schema);