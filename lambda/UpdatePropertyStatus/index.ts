import {DynamoDBStreamEvent} from "aws-lambda";
import {marshall, unmarshall} from "@aws-sdk/util-dynamodb";
import {Tenant} from "@models/tenant";
import {ddbClient} from "@libs/aws-client";
import {UpdateItemCommand} from "@aws-sdk/client-dynamodb";

export const main = async (event: DynamoDBStreamEvent) => {
  const {NewImage} = event.Records[0].dynamodb;

  // @ts-ignore
  const tenant: Tenant = unmarshall(NewImage);
  const { propertyId } = tenant.rent[0];

  await ddbClient.send(new UpdateItemCommand({
    Key: marshall({id: propertyId}),
    TableName: process.env.TENANT_TABLE_NAME,
    UpdateExpression: 'SET #status = :status',
    ExpressionAttributeValues: {
      // @ts-ignore
      ':status': marshall(`Not Available`)
    },
    ExpressionAttributeNames: {
      '#status': 'status',
    }
  }));

}