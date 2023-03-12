import type {ValidatedEventAPIGatewayProxyEvent} from "../../src/libs/api-gateway";
import {formatJSONResponse} from "../../src/libs/api-gateway";
import {middyfy} from "../../src/libs/lambda";
import {PutItemCommand} from "@aws-sdk/client-dynamodb";
import {marshall} from "@aws-sdk/util-dynamodb";
import schema from "./schema";
import {randomUUID} from "crypto";
import {Tenant} from "../../src/libs/types";
import {DateTime} from "luxon";
import {InternalServerError} from "http-errors";
import {ddbClient} from "../../src/libs/dynamodb-client";

const handler: ValidatedEventAPIGatewayProxyEvent<typeof schema> = async (event) => {
  const { name, phone, propertyType, propertyCost, amountPaid } = event.body;
  const date = DateTime.now();

  const tenant: Tenant = {
    id: randomUUID(),
    name,
    phone,
    propertyCost,
    propertyType,
    payments: [{
      amountPaid,
      balance: (propertyCost - amountPaid),
      year: date.year,
      paidOn: date.toUnixInteger(),
      expiresOn: date.plus({ year: 1}).minus({month: 1}).toUnixInteger(),
    }],
    notifyOn: date.plus({year: 1}).minus({month: -2}).toUnixInteger()
  }

  try{
    await ddbClient.send(new PutItemCommand({
      Item: marshall(tenant),
      TableName: process.env.TENANT_TABLE_NAME,
    }));
  }catch (e) {
    console.error(e);
    throw new InternalServerError();
  }

  return formatJSONResponse({
    message: `Tenant created successfully`,
    tenant
  });
};

export const main = middyfy(handler);