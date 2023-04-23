import {middyfy} from "@libs/lambda";
import {formatJSONResponse, ValidatedEventAPIGatewayProxyEvent} from "@libs/api-gateway";
import schema from "./schema";
import {ddbClient} from "@libs/aws-client";
import {PutItemCommand} from "@aws-sdk/client-dynamodb";
import {marshall} from "@aws-sdk/util-dynamodb";
import {InternalServerError} from "http-errors";
import {Property} from "@models/property";

const handler: ValidatedEventAPIGatewayProxyEvent<typeof schema> = async (event) => {
  const { city, state, address, cost, rooms } = event.body;

  try{
    // @ts-ignore
    const property = new Property({city, state, cost, address, rooms});
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
    return formatJSONResponse({ message: `An error occurred. Please try again`}, statusCode);
  }
}

export const main = middyfy(handler, schema);