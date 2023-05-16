import {DynamoDBStreamEvent} from "aws-lambda";
import {unmarshall} from "@aws-sdk/util-dynamodb";
import {Payment} from "@models/payment";
import {ddbDocClient} from "@libs/aws-client";
import {Tenant, TenantStatus} from "@models/tenant";
import {DateTime} from "luxon";
import { UpdateCommand } from "@aws-sdk/lib-dynamodb";

export const main = async (event: DynamoDBStreamEvent) => {
  const { NewImage }: { [p: string]: any } = event.Records[0].dynamodb;
  const { tenantId, expiresOn } = unmarshall(NewImage) as Payment;

  const notifyOn = DateTime.fromMillis(expiresOn * 1000).minus({month: 1}).toUnixInteger();

  await ddbDocClient.send(new UpdateCommand({
    Key: Tenant.BuildPK(tenantId),
    TableName: process.env.TENANT_TABLE_NAME,
    UpdateExpression: 'SET notifyOn = :notifyOn, #status = :status',
    ExpressionAttributeValues: {
      ':notifyOn': notifyOn,
      ':status': TenantStatus.Active
    },
    ExpressionAttributeNames: {
      '#status': 'status'
    }
  }));
}