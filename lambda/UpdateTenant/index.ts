import {GetItemCommand, UpdateItemCommand} from "@aws-sdk/client-dynamodb";
import {formatJSONResponse, ValidatedEventAPIGatewayProxyEvent} from "../../src/libs/api-gateway";
import schema from "./schema";
import {middyfy} from "../../src/libs/lambda";
import {marshall, unmarshall} from "@aws-sdk/util-dynamodb";
import {NotFound, InternalServerError } from "http-errors";
import {dynamoDBClient} from "../../src/libs/dynamodb-client";

const handler: ValidatedEventAPIGatewayProxyEvent<typeof schema> = async (event) => {
  const { id } = event.pathParameters;
  const { name, phone } = event.body;

  const tenant = await dynamoDBClient.send(new GetItemCommand({
    Key: marshall({ id }),
    TableName: process.env.TENANT_TABLE_NAME,
  }));

  if (tenant.Item === undefined) {
    throw new NotFound(`Tenant not found!`);
  }

  try{
    const item = await dynamoDBClient.send(new UpdateItemCommand({
      Key: marshall({ id }),
      TableName: process.env.TENANT_TABLE_NAME,
      UpdateExpression: 'SET #name = :name, phone = :phone',
      ExpressionAttributeValues: {
        ':name': { S: name }, //marshall(name),
        ':phone': { S : phone } //marshall(phone)
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
  }catch (e) {
    console.error(e);
    throw new InternalServerError();
  }
};

export const main = middyfy(handler);