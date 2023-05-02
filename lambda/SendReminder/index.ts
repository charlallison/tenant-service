import {QueryCommand} from "@aws-sdk/client-dynamodb";
import {marshall, unmarshall} from "@aws-sdk/util-dynamodb";
import {ddbClient, snsClient} from "@libs/aws-client";
import {PublishCommand} from "@aws-sdk/client-sns";
import {Tenant} from "@models/tenant";
import {DateTime} from "luxon";

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
    ProjectionExpression: 'phone, #name',
    ExpressionAttributeNames: {
      '#name': 'name',
    }
  }));

  response.Items.forEach(item => {
    sendSMS(unmarshall(item) as Tenant)
  });
};

const sendSMS = async (tenant: Pick<Tenant, 'phone' | 'name'>) => {
  const { phone, name } = tenant;

  await snsClient.send(new PublishCommand({
    PhoneNumber: phone,
    Message: `Hi ${name}, I hope you're doing great. This is a gentle reminder that your rent will expire next month. Please endeavour to pay in due time`,
    MessageAttributes: {
      "AWS.SNS.SMS.SenderID": {
        DataType: "String",
        StringValue: process.env.SENDER_ID,
      }
    }
  }));
}