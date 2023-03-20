import {ValidatedEventAPIGatewayProxyEvent} from "@libs/api-gateway";
import schema from "./schema";
import {QueryCommand} from "@aws-sdk/client-dynamodb";
import {DateTime} from "luxon";
import {marshall} from "@aws-sdk/util-dynamodb";
import {ddbClient, snsClient} from "@libs/aws-client";
import {PublishCommand} from "@aws-sdk/client-sns";
import {Tenant} from "@libs/models";

// @ts-ignore
export const main: ValidatedEventAPIGatewayProxyEvent<typeof schema> = async (event) => {
  const { year, month } = DateTime.now().plus({year: 1}).minus({ month: -2});
  const notifyDate = DateTime.local(year, month).toUnixInteger();
  let response;

  try {
    response = await ddbClient.send(new QueryCommand({
      IndexName: 'IndexNotifyOn',
      TableName: process.env.TENANT_TABLE_NAME,
      KeyConditionExpression: 'notifyOn = :notifyOn',
      ExpressionAttributeValues: {
        ':notifyOn': marshall(notifyDate)
      },
      ProjectionExpression: 'phone, #name',
      ExpressionAttributeNames: {
        '#name': 'name',
      }
    }));
  }catch (e) {
    console.error(e);
  }

  response.Items.forEach(item => {
    sendSMS(item)
  });
};

const sendSMS = async (tenant: Pick<Tenant, 'phone' | 'name'>) => {
  const { phone, name } = tenant;

  await snsClient.send(new PublishCommand({
    PhoneNumber: phone,
    Message: `Hi ${name}, I hope you're doing great. This is a reminder that your rent expires next month.`,
    MessageAttributes: {
      "AWS.SNS.SMS.SenderID": {
        DataType: "String",
        StringValue: process.env.SENDER_ID,
      },
      "AWS.SNS.SMS.SMSType": {
        DataType: "String",
        StringValue: "Promotional"
      }
    }
  }));
}