import {DynamoDBStreamEvent} from "aws-lambda";
import {Tenant} from "@models/tenant";
import {marshall, unmarshall} from "@aws-sdk/util-dynamodb";
import {ddbClient} from "@libs/aws-client";
import {QueryCommand} from "@aws-sdk/client-dynamodb";
import {Payment} from "@models/payment";
import {sendSMS} from "../util-sms";

export const main = async (event: DynamoDBStreamEvent) => {
  const { NewImage }: { [key: string]: any } = event.Records[0].dynamodb;

  const payment = unmarshall(NewImage) as Payment;
  const {name, phone} = await getTenant(payment);

  const message = `Hi ${name}! Your payment of N${payment.amount} Naira has been received.`;
  await sendSMS(message, phone, process.env.SENDER_ID)
}

const getTenant = async (payment: Payment) => {
  const response = await ddbClient.send(new QueryCommand({
    TableName: process.env.TENANT_TABLE_NAME,
    IndexName: 'TenantIndex',
    KeyConditionExpression: '#pk = :pk',
    FilterExpression: '#type = :type',
    ExpressionAttributeValues: {
      // @ts-ignore
      ':pk': marshall(payment.PK),
      // @ts-ignore
      ':type': marshall(Tenant.name)
    },
    ExpressionAttributeNames: {
      '#pk': 'PK',
      '#type': 'Type',
      '#name': 'name',
      '#phone': 'phone'
    },
    ProjectionExpression: '#name, #phone'
  }))

  return unmarshall(response.Items[0]) as Tenant
}