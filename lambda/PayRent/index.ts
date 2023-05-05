import {formatJSONResponse, ValidatedEventAPIGatewayProxyEvent} from "@libs/api-gateway";
import schema from "./schema";
import {PutItemCommand} from "@aws-sdk/client-dynamodb";
import {marshall} from "@aws-sdk/util-dynamodb";
import {middyfy} from "@libs/lambda";
import {BadRequest, NotFound} from "http-errors";
import {ddbClient} from "@libs/aws-client";
import {Payment} from "@models/payment";
import {PropertyStatus} from "@models/property";
import {findProperty, getTenantRecord} from "../util-payment";

const EXPECTED_RECORD_LENGTH: number = 2;
const { message, statusCode } = new BadRequest(`Property not available`);

const handler: ValidatedEventAPIGatewayProxyEvent<typeof schema> = async (event) => {
  const { id } = event.pathParameters
  const { amount, propertyId }: { [key: string]: any } = event.body;
  let payment: Payment;

  // ensure the property exists
  const property = await findProperty(propertyId);
  if(!property) {
    const { message, statusCode } = new NotFound(`Property not found`);
    return formatJSONResponse({ message }, statusCode);
  }

  const record = await getTenantRecord(id);
  if(!record) {
    const { message, statusCode } = new NotFound(`Tenant not found`)
    return formatJSONResponse({ message }, statusCode);
  }

  if(record.length === EXPECTED_RECORD_LENGTH) {
    payment = record[1] as Payment;

    if(payment.propertyId !== propertyId) {
      return formatJSONResponse({ message }, statusCode);
    }
  }

  if(payment && property.status === PropertyStatus.NotAvailable && payment.tenantId !== id) {
    return formatJSONResponse({ message }, statusCode);
  }

  if(property.cost != amount) {
    const { message, statusCode } = new BadRequest(`Invalid amount ${amount}`);
    return formatJSONResponse({message}, statusCode);
  }

  payment = new Payment({ tenantId: id, amount, propertyId });

  await ddbClient.send(new PutItemCommand({
    TableName: process.env.TENANT_TABLE_NAME,
    Item: marshall(payment, {convertClassInstanceToMap: true})
  }));

  return formatJSONResponse({
    message: `Rent has been paid`,
    payment
  });
}

export const main = middyfy(handler, schema);