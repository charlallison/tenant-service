import {middyfy} from "@libs/lambda";
import {formatJSONResponse, ValidatedEventAPIGatewayProxyEvent} from "@libs/api-gateway";
import schema from "./schema";
import {ddbClient} from "@libs/aws-client";
import {PutItemCommand} from "@aws-sdk/client-dynamodb";
import {marshall} from "@aws-sdk/util-dynamodb";
import {Property} from "@models/property";

const handler: ValidatedEventAPIGatewayProxyEvent<typeof schema> = async (event) => {
  const { city, state, address, cost, rooms }: { [key: string]: any } = event.body;

  const property = new Property({city, state, cost, address, rooms});

  await ddbClient.send(new PutItemCommand({
    TableName: process.env.TENANT_TABLE_NAME,
    Item: marshall(property, {convertClassInstanceToMap: true})
  }));


  return formatJSONResponse({
    message: `Property created`,
    property
  }, 201);
}

export const main = middyfy(handler, schema);