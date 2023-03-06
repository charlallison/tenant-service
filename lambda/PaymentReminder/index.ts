import {formatJSONResponse, ValidatedEventAPIGatewayProxyEvent} from "../../src/libs/api-gateway";
import schema from "./schema";
import {QueryCommand} from "@aws-sdk/client-dynamodb";
import {InternalServerError} from "http-errors";
import {DateTime} from "luxon";
import {marshall, unmarshall} from "@aws-sdk/util-dynamodb";
import {dynamoDBClient} from "../../src/libs/dynamodb-client";

export const main: ValidatedEventAPIGatewayProxyEvent<typeof schema> = async (event) => {
  const { year, month } = DateTime.now().plus({year: 1}).minus({ month: -2});
  const notifyDate = DateTime.local(year, month).toUnixInteger();

  try {
    const result = await dynamoDBClient.send(new QueryCommand({
      TableName: process.env.TENANT_TABLE_NAME,
      IndexName: 'IndexNotifyOn',
      KeyConditionExpression: 'notifyOn = :notifyOn',
      ExpressionAttributeValues: {
        ':notifyOn': marshall(notifyDate)
      }
    }));
    const items = result.Items.map(item => unmarshall(item));

    formatJSONResponse({
      data: items
    })
  }catch (e) {
    console.error(e);
    throw new InternalServerError();
  }
}