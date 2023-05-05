import {ddbClient} from "@libs/aws-client";
import {GetItemCommand, QueryCommand} from "@aws-sdk/client-dynamodb";
import {marshall, unmarshall} from "@aws-sdk/util-dynamodb";
import {Tenant} from "@models/tenant";

export const getTenantById = async(id: string) => {
  const response = await ddbClient.send(new GetItemCommand({
    TableName: process.env.TENANT_TABLE_NAME,
    Key: marshall(Tenant.BuildKeys(id)),
    ConsistentRead: true
  }));

  if(response.Item) {
    return unmarshall(response.Item) as Tenant;
  }
}

export const getTenantByPhone = async(phone: string) => {
  return await ddbClient.send(new QueryCommand({
    TableName: process.env.TENANT_TABLE_NAME,
    IndexName: 'PhoneIndex',
    KeyConditionExpression: 'phone = :phone',
    ExpressionAttributeValues: {
      // @ts-ignore
      ':phone': marshall(phone)
    }
  }))
}