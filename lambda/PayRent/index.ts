import {formatJSONResponse, ValidatedEventAPIGatewayProxyEvent} from "@libs/api-gateway";
import schema from "./schema";
import {GetItemCommand, PutItemCommand} from "@aws-sdk/client-dynamodb";
import {marshall, unmarshall} from "@aws-sdk/util-dynamodb";
import {middyfy} from "@libs/lambda";
import {BadRequest, InternalServerError} from "http-errors";
import {ddbClient} from "@libs/aws-client";
import {Payment} from "@models/payment";
import {TenantStatus, Tenant} from "@models/tenant";
import {Property, PropertyStatus} from "@models/property";

const handler: ValidatedEventAPIGatewayProxyEvent<typeof schema> = async (event) => {
  const { id } = event.pathParameters
  const { amount, propertyId } = event.body;
  // @ts-ignore
  const tenant = unmarshall(await findTenant(id)) as Tenant;
  if(!tenant || tenant.status !== TenantStatus.NotActive) {
    return formatJSONResponse({message: `Payment not successful`}, 404);
  }
  // @ts-ignore
  const property = unmarshall(await findProperty(propertyId)) as Property;
  if(!property || property.status !== PropertyStatus.Available) {
    return formatJSONResponse({message: `Payment not successful`}, 404);
  }

  if(property.cost != amount) {
    const { message, statusCode } = new BadRequest(`Invalid amount: ${amount}`);
    return formatJSONResponse({message}, statusCode);
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


const findTenant = async (tenantId: string) => {
  const response = await ddbClient.send(new GetItemCommand({
    TableName: process.env.TENANT_TABLE_NAME,
    Key: marshall(Tenant.BuildKeys(tenantId))
  }))

  return response.Item;
}

const findProperty = async (propertyId: string) => {
  const response = await ddbClient.send(new GetItemCommand({
    TableName: process.env.TENANT_TABLE_NAME,
    Key: marshall(Property.BuildKeys(propertyId))
  }));

  return response.Item
}

export const main = middyfy(handler, schema);