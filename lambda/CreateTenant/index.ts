import type {ValidatedEventAPIGatewayProxyEvent} from "@libs/api-gateway";
import {formatJSONResponse} from "@libs/api-gateway";
import {middyfy} from "@libs/lambda";
import { PutItemCommand} from "@aws-sdk/client-dynamodb";
import {marshall} from "@aws-sdk/util-dynamodb";
import schema from "./schema";
import {ddbClient} from "@libs/aws-client";
import {Tenant} from "@models/tenant";
// import {DateTime} from "luxon";
// import {Property} from "@models/property";
// import {NotFound} from "http-errors";

const handler: ValidatedEventAPIGatewayProxyEvent<typeof schema> = async (event) => {
  const { name, phone, email } = event.body;

  try{
    // @ts-ignore
    const tenant = new Tenant({ name, phone, email });

    // @ts-ignore
    // const item = await findProperty(propertyId);
    // if(!item) {
    //   const error = new NotFound(`Property not found`);
    //   return formatJSONResponse({error}, error.statusCode);
    // }

    await ddbClient.send(new PutItemCommand({
      Item: marshall(tenant, {convertClassInstanceToMap: true}),
      TableName: process.env.TENANT_TABLE_NAME
    }));

    return formatJSONResponse({
      message: `Tenant created successfully`,
      tenant
    });
  }catch (e) {
    return formatJSONResponse({ message: e.message }, 500)
  }
};

// const findProperty = async (propertyId: string) => {
//   const property = Property.From({id: propertyId});
//   const response = await ddbClient.send(new GetItemCommand({
//     TableName,
//     Key: marshall({:}),
//   }));
//
//   return response.Item;
// }

// const getDates = () => {
//   const date = DateTime.now();
//
//   return {
//     paidOn: date.toUnixInteger(),
//     expiresOn: date.plus({ year: 1}).minus({month: 1}).toUnixInteger(),
//     notifyOn: date.plus({year: 1}).minus({month: 2}).toUnixInteger()
//   }
// }

export const main = middyfy(handler, schema);