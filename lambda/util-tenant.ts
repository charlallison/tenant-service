import {ddbDocClient} from "@libs/aws-client";
import {Tenant} from "@models/tenant";
import {GetCommand} from "@aws-sdk/lib-dynamodb";

export const getTenantById = async(id: string) => {
  const response = await ddbDocClient.send(new GetCommand({
    TableName: process.env.TENANT_TABLE_NAME,
    Key: Tenant.BuildPK(id),
    ConsistentRead: true
  }));

  if(response.Item) {
    return response.Item as Tenant;
  }
}