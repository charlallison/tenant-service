import {snsClient} from "@libs/aws-client";
import {PublishCommand} from "@aws-sdk/client-sns";

export const sendSMS = async (message: string, phoneNumber: string, sender: string) => {
  await snsClient.send(new PublishCommand({
    PhoneNumber: phoneNumber,
    Message: message,
    MessageAttributes: {
      "AWS.SNS.SMS.SenderID": {
        DataType: "String",
        StringValue: sender,
      }
    }
  }));
}