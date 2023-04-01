import {formatJSONResponse, ValidatedEventAPIGatewayProxyBD} from "@libs/api-gateway";
import schema from "./schema";
import {middyfy} from "@libs/lambda";
import {ddbClient} from "@libs/aws-client";
import {UpdateItemCommand} from "@aws-sdk/client-dynamodb";
import {marshall} from "@aws-sdk/util-dynamodb";
import * as console from "console";

const handler: ValidatedEventAPIGatewayProxyBD<typeof schema> = async (event) => {
  const { id } = event.pathParameters;
  const { title, description } = event.body;
  console.log(title, description, id);

  await ddbClient.send(new UpdateItemCommand({
    TableName: process.env.TENANT_TABLE_NAME,
    Key: marshall({id}),
    UpdateExpression: `SET title = :title, description = :description`,
    ExpressionAttributeValues: {
      // @ts-ignore
      ':title': marshall(title),
      // @ts-ignore
      ':description': marshall(description)
    },
  }));

  return formatJSONResponse({
    message: `Property updated successfully`
  });

}

export const main = middyfy(handler, schema);