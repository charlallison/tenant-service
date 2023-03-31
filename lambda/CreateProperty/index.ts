import {middyfy} from "@libs/lambda";
import {formatJSONResponse, ValidatedEventAPIGatewayProxyEvent} from "@libs/api-gateway";
import schema from "./schema";
import {ddbClient} from "@libs/aws-client";
import {GetItemCommand, PutItemCommand} from "@aws-sdk/client-dynamodb";
import {marshall} from "@aws-sdk/util-dynamodb";
import {BadRequest, InternalServerError} from "http-errors";
import {Property} from "@models/property";

const handler: ValidatedEventAPIGatewayProxyEvent<typeof schema> = async (event) => {
  const { cost, description, rooms, title } = event.body;

  // @ts-ignore
  const property = Property.From({title, cost, description, rooms});

  try{
    const result = await ddbClient.send(new GetItemCommand({
      TableName: process.env.TENANT_TABLE_NAME,
      Key: marshall({id: property.id})
    }));

    if (result.Item) {
      const {message, statusCode} = new BadRequest(`Property exists`);
      return formatJSONResponse({ message }, statusCode);
    }

    await ddbClient.send(new PutItemCommand({
      TableName: process.env.TENANT_TABLE_NAME,
      Item: marshall(property, {convertClassInstanceToMap: true})
    }));

    return formatJSONResponse({
      message: `New property saved`,
      property
    });
  }catch (e) {
    const {statusCode} = new InternalServerError();
    console.error(e);
    return formatJSONResponse({ message: `An error occurred. Please try again`}, statusCode);
  }

}

export const main = middyfy(handler, schema);