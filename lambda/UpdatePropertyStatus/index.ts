import {DynamoDBStreamEvent} from "aws-lambda";
import {unmarshall} from "@aws-sdk/util-dynamodb";
import {Payment} from "@models/payment";
import {Property, PropertyStatus} from "@models/property";
import {ddbDocClient} from "@libs/aws-client";
import {UpdateCommand} from "@aws-sdk/lib-dynamodb";

export const main = async (event: DynamoDBStreamEvent) => {
  const { NewImage }: { [key: string]: any } = event.Records[0].dynamodb;
  const { propertyId} = unmarshall(NewImage) as Payment;

  await ddbDocClient.send(new UpdateCommand({
    Key: Property.BuildPK(propertyId),
    TableName: process.env.TENANT_TABLE_NAME,
    UpdateExpression: 'SET #status = :status',
    ExpressionAttributeValues: {
      ':status': PropertyStatus.NotAvailable
    },
    ExpressionAttributeNames: {
      '#status': 'status'
    }
  }));

}