import {ddbDocClient} from "@libs/aws-client";
import {Tenant, TenantStatus} from "@models/tenant";
import {DateTime} from "luxon";
import {sendSMS} from "../util-sms";
import {GSIs} from "../gsi-index";
import { QueryCommand } from "@aws-sdk/lib-dynamodb";

export const main = async () => {
  const { year, month } = DateTime.now();
  const date = DateTime.utc(year, month).toUnixInteger();
  const { GSI2PK } = Tenant.BuildGSIKeys();

  const response = await ddbDocClient.send(new QueryCommand({
    IndexName: GSIs.GSI2,
    TableName: process.env.TENANT_TABLE_NAME,
    KeyConditionExpression: '#gsi2pk = :gsi2pk',
    FilterExpression: '#notifyOn = :notifyOn AND #status = :status',
    ExpressionAttributeValues: {
      ':gsi2pk': GSI2PK,
      ':notifyOn': date,
      ':status': TenantStatus.Active
    },
    ProjectionExpression: '#phone, #name',
    ExpressionAttributeNames: {
      '#name': 'name',
      '#phone': 'phone',
      '#status': 'status',
      '#notifyOn': 'notifyOn'
    }
  }));

  response.Items.forEach(item => {
    const { name, phone} = item as Pick<Tenant, 'name' | 'phone'>
    const message = `Hi ${name}, I hope you're doing great. This is a gentle reminder that your rent will expire next month. Please endeavour to pay in due time`

    sendSMS(message, phone, process.env.SENDER_ID)
  });
};