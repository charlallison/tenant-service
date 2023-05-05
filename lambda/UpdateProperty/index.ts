import {formatJSONResponse, ValidatedEventAPIGatewayProxyEvent} from "@libs/api-gateway";
import schema from "./schema";
import {middyfy} from "@libs/lambda";
import {ddbClient} from "@libs/aws-client";
import {ReturnValue, UpdateItemCommand} from "@aws-sdk/client-dynamodb";
import {marshall, unmarshall} from "@aws-sdk/util-dynamodb";
import {Property} from "@models/property";

const handler: ValidatedEventAPIGatewayProxyEvent<typeof schema> = async (event) => {
  const { id } = event.pathParameters;
  const { cost, rooms }: { [key: string]: any } = event.body;

  const response = await ddbClient.send(new UpdateItemCommand({
    TableName: process.env.TENANT_TABLE_NAME,
    Key: marshall(Property.BuildKeys(id)),
    UpdateExpression: `SET cost = :cost, rooms = :rooms`,
    ExpressionAttributeValues: {
      // @ts-ignore
      ':cost': marshall(cost),
      // @ts-ignore
      ':rooms': marshall(rooms)
    },
    ReturnValues: ReturnValue.ALL_NEW
  }));

  return formatJSONResponse({
    message: `Property updated!`,
    property: unmarshall(response.Attributes)
  });

}

export const main = middyfy(handler, schema);