import {DynamoDBStreamEvent} from "aws-lambda";
import {unmarshall} from "@aws-sdk/util-dynamodb";
import {Payment} from "@models/payment";
import {sendSMS} from "../util-sms";
import {getTenantById} from "../util-tenant";

export const main = async (event: DynamoDBStreamEvent) => {
  const { NewImage }: { [key: string]: any } = event.Records[0].dynamodb;
  const payment = unmarshall(NewImage) as Payment;

  const { name, phone } = await getTenantById(payment.tenantId);
  if(!name || !phone) return;

  const message = `Hi ${name}, Your payment of N${payment.amount} has been received.`;

  await sendSMS(message, phone, process.env.SENDER_ID)
}