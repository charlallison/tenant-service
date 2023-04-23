import {formatJSONResponse, ValidatedEventAPIGatewayProxyEvent} from "@libs/api-gateway";
import schema from "./schema";
import {GetItemCommand, PutItemCommand} from "@aws-sdk/client-dynamodb";
import {marshall} from "@aws-sdk/util-dynamodb";
import {middyfy} from "@libs/lambda";
import {InternalServerError} from "http-errors";
import {ddbClient} from "@libs/aws-client";
import {Payment} from "@models/payment";
import {Tenant} from "@models/tenant";
import {Property} from "@models/property";

const handler: ValidatedEventAPIGatewayProxyEvent<typeof schema> = async (event) => {
  const { id } = event.pathParameters
  const { amount, propertyId } = event.body;

  // @ts-ignore
  let item = await verifyTenant(id);
  if(!item) {
    return formatJSONResponse({message: `Tenant not found`}, 404);
  }
  // @ts-ignore
  item = await verifyProperty(propertyId);
  if(!item) {
    return formatJSONResponse({message: `Property not found`}, 404);
  }

  // @ts-ignore
  const payment = new Payment(id, { amount, propertyId });

  try{
    await ddbClient.send(new PutItemCommand({
      TableName: process.env.TENANT_TABLE_NAME,
      Item: marshall(payment, {convertClassInstanceToMap: true})
    }));

    return formatJSONResponse({
      message: `Rent has been paid`,
      payment
    })
  }catch (e) {
    throw new InternalServerError(e);
  }
}


const verifyTenant = async (tenantId: string) => {
  const response = await ddbClient.send(new GetItemCommand({
    TableName: process.env.TENANT_TABLE_NAME,
    Key: marshall(Tenant.BuildKeys(tenantId))
  }))

  return response.Item;
}

const verifyProperty = async (propertyId: string) => {
  const response = await ddbClient.send(new GetItemCommand({
    TableName: process.env.TENANT_TABLE_NAME,
    Key: marshall(Property.BuildKeys(propertyId))
  }));

  return response.Item
}

export const main = middyfy(handler, schema);