import {middyfy} from "@libs/lambda";
import {formatJSONResponse, ValidatedEventAPIGatewayProxyEvent} from "@libs/api-gateway";
import schema from "./schema";
import {ddbDocClient} from "@libs/aws-client";
import {Property} from "@models/property";
import {PutCommand} from "@aws-sdk/lib-dynamodb";

const handler: ValidatedEventAPIGatewayProxyEvent<typeof schema> = async (event) => {
  const { city, state, address, cost, rooms }: { [key: string]: any } = event.body;

  const property = new Property({city, state, cost, address, rooms});

  await ddbDocClient.send(new PutCommand({
    TableName: process.env.TENANT_TABLE_NAME,
    Item: property
  }));


  return formatJSONResponse({
    message: `Property created`,
    property
  }, 201);
}

export const main = middyfy(handler, schema);