import {DynamoDBStreamEvent} from "aws-lambda";
import {marshall, unmarshall} from "@aws-sdk/util-dynamodb";
import {Payment} from "@models/payment";
import {Property, PropertyStatus} from "@models/property";
import {ddbClient} from "@libs/aws-client";
import {UpdateItemCommand} from "@aws-sdk/client-dynamodb";

export const main = async (event: DynamoDBStreamEvent) => {
  const {NewImage} = event.Records[0].dynamodb;
  // @ts-ignore
  const payment = unmarshall(NewImage) as Payment;

  await ddbClient.send(new UpdateItemCommand({
    Key: marshall(Property.BuildKeys(payment.propertyId)),
    TableName: process.env.TENANT_TABLE_NAME,
    UpdateExpression: 'SET #status = :status',
    ExpressionAttributeValues: {
      // @ts-ignore
      ':status': marshall(PropertyStatus.NotAvailable)
    },
    ExpressionAttributeNames: {
      '#status': 'status',
    }
  }));

}