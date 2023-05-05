import {ddbClient} from "@libs/aws-client";
import {GetItemCommand, QueryCommand} from "@aws-sdk/client-dynamodb";
import {marshall, unmarshall} from "@aws-sdk/util-dynamodb";
import {Tenant} from "@models/tenant";
import {Property} from "@models/property";

export const getTenantRecord = async(id: string) => {
  const response = await ddbClient.send(new QueryCommand({
    TableName: process.env.TENANT_TABLE_NAME,
    IndexName: 'TenantIndex',
    KeyConditionExpression: 'PK = :pk',
    ScanIndexForward: true, // default is true but explicitly stated for emphasis
    ExpressionAttributeValues: {
      // @ts-ignore
      ':pk': marshall(Tenant.BuildKeys(id).PK)
    },
    Limit: 2
  }));

  if(response.Items.length > 0) {
    return response.Items.map(item => unmarshall(item))
  }

}

export const findProperty = async (propertyId: string) => {
  const response = await ddbClient.send(new GetItemCommand({
    TableName: process.env.TENANT_TABLE_NAME,
    Key: marshall(Property.BuildKeys(propertyId))
  }));

  if(response.Item){
    return unmarshall(response.Item) as Property;
  }
}