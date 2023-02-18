import {formatJSONResponse, ValidatedEventAPIGatewayProxyEvent} from "../../src/libs/api-gateway";
import schema from "./schema";
import {DynamoDBClient, GetItemCommand, UpdateItemCommand} from "@aws-sdk/client-dynamodb";
import {marshall, unmarshall} from "@aws-sdk/util-dynamodb";
import {middyfy} from "../../src/libs/lambda";
import {InternalServerError, NotFound} from "http-errors";
import {Tenant} from "../../src/libs/types";
import {DateTime} from "luxon";

const dynamodbClient = new DynamoDBClient({
  region: process.env.REGION
})

const handler: ValidatedEventAPIGatewayProxyEvent<typeof schema> = async (event) => {
  const date = DateTime.now();
  const { id } = event.pathParameters;
  const { amount } = event.body;

  const result = await dynamodbClient.send(new GetItemCommand({
    TableName: process.env.TENANT_TABLE_NAME,
    Key: marshall({ id })
  }));

  if(!result.Item) {
    throw new NotFound();
  }

  const tenant = unmarshall(result.Item) as Tenant;

  if(amount > tenant.propertyCost) {
    throw new InternalServerError(`Rent cannot be greater than annual recurring rent!`);
  }


  // const payment = new Array<Payment>();
  const payment = {
    year: date.year,
    paidOn: date.toUnixInteger(),
    validThrough: date.plus({ year: 1}).minus({day: 1}).toUnixInteger(),
    balance: tenant.propertyCost - amount,
    amountPaid: amount
  };

  try{
    const result = await dynamodbClient.send(new UpdateItemCommand({
      TableName: process.env.TENANT_TABLE_NAME,
      Key: marshall({ id }),
      UpdateExpression: 'SET #pmts = list_append(#pmts, :payment)',
      ExpressionAttributeValues: {
        ':payment': { "L": [{ "M": marshall(payment) }] }
      },
      ExpressionAttributeNames: {
        '#pmts': 'payments'
      }
    }))

    console.log(result);

    return formatJSONResponse({
      message: `Rent has been paid`,
      // tenant: unmarshall(result.Attributes)
    })
  }catch (e) {
    console.error(e);
    throw new InternalServerError(e);
  }
}

export const main = middyfy(handler);