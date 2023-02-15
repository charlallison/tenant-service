import {DynamoDBClient, GetItemCommand, UpdateItemCommand} from "@aws-sdk/client-dynamodb";
import {formatJSONResponse, ValidatedEventAPIGatewayProxyEvent} from "../../src/libs/api-gateway";
import schema from "./schema";
import {middyfy} from "../../src/libs/lambda";
import {marshall} from "@aws-sdk/util-dynamodb";
import {NotFound, InternalServerError } from "http-errors";

const dynamoDBClient = new DynamoDBClient({
  region: process.env.REGION
})

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
    await dynamoDBClient.send(new UpdateItemCommand({
      Key: marshall({ id }),
      TableName: process.env.TENANT_TABLE_NAME,
      UpdateExpression: 'SET name = :name, phone = :phone',
      ExpressionAttributeValues: {
        ':name': marshall(name),
        ':phone': marshall(phone)
      },
      ReturnValues: 'ALL_NEW',
    }));
  }catch (e) {
    console.error(e);
    throw new InternalServerError();
  }


  return formatJSONResponse({
    message: `Tenant updated!`
  });


};

export const main = middyfy(handler);