import {formatJSONResponse, ValidatedEventAPIGatewayProxyEvent} from "@libs/api-gateway";
import schema from "./schema";
import {GetItemCommand, UpdateItemCommand} from "@aws-sdk/client-dynamodb";
import {marshall, unmarshall} from "@aws-sdk/util-dynamodb";
import {middyfy} from "@libs/lambda";
import {InternalServerError, NotFound} from "http-errors";
import {Tenant} from "@libs/models";
import {DateTime} from "luxon";
import {ddbClient} from "@libs/aws-client";

const handler: ValidatedEventAPIGatewayProxyEvent<typeof schema> = async (event) => {
  const date = DateTime.now();
  const { id } = event.pathParameters;
  const { amount } = event.body;

  const result = await ddbClient.send(new GetItemCommand({
    TableName: process.env.TENANT_TABLE_NAME,
    Key: marshall({ id })
  }));

  if(!result.Item) {
    throw new NotFound();
  }

  const tenant = unmarshall(result.Item) as Tenant;

  if(amount > tenant.propertyCost) {
    const {message, statusCode} = new InternalServerError(`Rent cannot be greater than annual recurring rent!`);
    return formatJSONResponse({ message }, statusCode);
  }

  const payment = {
    year: date.year,
    paidOn: date.toUnixInteger(),
    validThrough: date.plus({ year: 1}).minus({day: 1}).toUnixInteger(),
    balance: tenant.propertyCost - amount,
    amountPaid: amount
  };

  try{
    await ddbClient.send(new UpdateItemCommand({
      TableName: process.env.TENANT_TABLE_NAME,
      Key: marshall({ id }),
      UpdateExpression: 'SET #pmts = list_append(#pmts, :payment)',
      ExpressionAttributeValues: {
        ':payment': { "L": [{ "M": marshall(payment) }] }
      },
      ExpressionAttributeNames: {
        '#pmts': 'payments'
      }
    }));

    return formatJSONResponse({
      message: `Rent has been paid`,
    })
  }catch (e) {
    console.error(e);
    throw new InternalServerError(e);
  }
}

export const main = middyfy(handler);