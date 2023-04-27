import {DynamoDBStreamEvent} from "aws-lambda";
import {Tenant} from "@models/tenant";
import {marshall, unmarshall} from "@aws-sdk/util-dynamodb";
import {ddbClient, snsClient} from "@libs/aws-client";
import {PublishCommand} from "@aws-sdk/client-sns";
import {GetItemCommand} from "@aws-sdk/client-dynamodb";
import {Payment} from "@models/payment";
import * as console from "console";

export const main = async (event: DynamoDBStreamEvent) => {
  const { NewImage } = event.Records[0].dynamodb;
  // @ts-ignore
  const payment = unmarshall(NewImage) as Payment;
  const id = payment.pk.replace('tenant#id=', ``);

  const response = await ddbClient.send(new GetItemCommand({
    Key: marshall(Tenant.BuildKeys(id)),
    TableName: process.env.TENANT_TABLE_NAME
  }));

  const tenant = unmarshall(response.Item) as Tenant;

  let message = `Hi ${tenant.name}! Your payment of ${payment.amount} Naira has been received.`;

  try {
    await snsClient.send(new PublishCommand({
      PhoneNumber: tenant.phone,
      Message: message,
      MessageAttributes: {
        "AWS.SNS.SMS.SenderID": {
          DataType: "String",
          StringValue: process.env.SENDER_ID,
        }
      }
    }));
  }catch (e) {
    console.log(e)
  }

}