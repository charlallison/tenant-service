import {QueryCommand} from "@aws-sdk/client-dynamodb";
import {marshall, unmarshall} from "@aws-sdk/util-dynamodb";
import {ddbClient} from "@libs/aws-client";
import {Tenant} from "@models/tenant";
import {DateTime} from "luxon";
import {sendSMS} from "../util-sms";

export const main = async () => {
  const { year, month } = DateTime.now();
  const notificationDate = DateTime.utc(year, month).toUnixInteger();

  const response = await ddbClient.send(new QueryCommand({
    IndexName: 'NotificationDateIndex',
    TableName: process.env.TENANT_TABLE_NAME,
    KeyConditionExpression: 'notificationDate = :notificationDate',
    ExpressionAttributeValues: {
      // @ts-ignore
      ':notificationDate': marshall(notificationDate)
    },
    ProjectionExpression: '#phone, #name',
    ExpressionAttributeNames: {
      '#name': 'name',
      '#phone': 'phone'
    }
  }));

  response.Items.forEach(item => {
    const {name, phone} = unmarshall(item) as Pick<Tenant, 'name' | 'phone'>
    const message = `Hi ${name}, I hope you're doing great. This is a gentle reminder that your rent will expire next month. Please endeavour to pay in due time`

    sendSMS(message, phone, process.env.SENDER_ID)
  });
};