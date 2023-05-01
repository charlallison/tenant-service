import {DynamoDBStreamEvent} from "aws-lambda";
import {Tenant} from "@models/tenant";
import {marshall, unmarshall} from "@aws-sdk/util-dynamodb";
import {ddbClient, snsClient} from "@libs/aws-client";
import {PublishCommand} from "@aws-sdk/client-sns";
import {QueryCommand} from "@aws-sdk/client-dynamodb";
import {Payment} from "@models/payment";

export const main = async (event: DynamoDBStreamEvent) => {
  const { NewImage } = event.Records[0].dynamodb;
  // @ts-ignore
  const payment = unmarshall(NewImage) as Payment;

  const response = await ddbClient.send(new QueryCommand({
    TableName: process.env.TENANT_TABLE_NAME,
    IndexName: 'TenantIndex',
    KeyConditionExpression: '#pk = :pk',
    FilterExpression: '#type = :type',
    ExpressionAttributeValues: {
      // @ts-ignore
      ':pk': marshall(payment.pk),
      // @ts-ignore
      ':type': marshall(Tenant.name)
    },
    ExpressionAttributeNames: {
      '#pk': 'pk',
      '#type': 'Type'
    },
    ProjectionExpression: 'name, phone'
  }));

  const tenant = unmarshall(response.Items[0]) as Tenant;

  await snsClient.send(new PublishCommand({
    PhoneNumber: tenant.phone,
    Message: `Hi ${tenant.name}! Your payment of N${payment.amount} Naira has been received.`,
    MessageAttributes: {
      "AWS.SNS.SMS.SenderID": {
        DataType: "String",
        StringValue: process.env.SENDER_ID,
      }
    }
  }));

}