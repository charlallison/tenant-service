import {DynamoDBStreamEvent} from "aws-lambda";
import {marshall, unmarshall} from "@aws-sdk/util-dynamodb";
import {Payment} from "@models/payment";
import {ddbClient} from "@libs/aws-client";
import {UpdateItemCommand} from "@aws-sdk/client-dynamodb";
import {Tenant, TenantStatus} from "@models/tenant";
import {DateTime} from "luxon";

export const main = async (event: DynamoDBStreamEvent) => {
  const { NewImage } = event.Records[0].dynamodb;
  // @ts-ignore
  const payment= unmarshall(NewImage) as Payment;
  const id = payment.pk.replace('tenant#id=', ``);

  const notificationDate = DateTime.fromMillis(payment.expiresOn * 1000).minus({month: 1}).toUnixInteger();

  await ddbClient.send(new UpdateItemCommand({
    Key: marshall(Tenant.BuildKeys(id)),
    TableName: process.env.TENANT_TABLE_NAME,
    UpdateExpression: 'SET notificationDate = :notificationDate, #status = :status',
    ExpressionAttributeValues: {
      // @ts-ignore
      ':notificationDate': marshall(notificationDate),
      // @ts-ignore
      ':status': marshall(TenantStatus.Active)
    },
    ExpressionAttributeNames: {
      '#status': 'status'
    }
  }))

}