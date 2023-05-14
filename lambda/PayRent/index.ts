import {formatJSONResponse, ValidatedEventAPIGatewayProxyEvent} from "@libs/api-gateway";
import schema from "./schema";
import {middyfy} from "@libs/lambda";
import {BadRequest, NotFound} from "http-errors";
import {ddbDocClient} from "@libs/aws-client";
import {Payment} from "@models/payment";
import {Property, PropertyStatus} from "@models/property";
import {GetCommand, PutCommand, QueryCommand} from "@aws-sdk/lib-dynamodb";
import {Tenant} from "@models/tenant";
import {GSIs} from "../gsi-index";

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

  await ddbDocClient.send(new PutCommand({
    TableName: process.env.TENANT_TABLE_NAME,
    Item: payment
  }));

  return formatJSONResponse({
    message: `Rent has been paid`,
    payment
  });
}


const findProperty = async (propertyId: string) => {
  const response = await ddbDocClient.send(new GetCommand({
    TableName: process.env.TENANT_TABLE_NAME,
    Key: Property.BuildPK(propertyId)
  }));

  if(response.Item){
    return response.Item as Property;
  }
}

const getTenantRecord = async(id: string) => {
  const { GSI1PK } = Tenant.BuildGSIKeys({ id });

  const response = await ddbDocClient.send(new QueryCommand({
    TableName: process.env.TENANT_TABLE_NAME,
    IndexName: GSIs.GSI1,
    KeyConditionExpression: '#gsi1pk = :gsi1pk',
    ExpressionAttributeValues: {
      ':gsi1pk': GSI1PK
    },
    ExpressionAttributeNames: {
      '#gsi1pk': 'GSI1PK',
    },
    ScanIndexForward: true, // default is true but explicitly stated for emphasis
    Limit: 2
  }));

  if(response.Items.length > 0) {
    return response.Items.map(item => item)
  }
}

export const main = middyfy(handler, schema);