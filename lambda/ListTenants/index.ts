import {formatJSONResponse, ValidatedEventAPIGatewayProxyEvent} from "@libs/api-gateway";
import {middyfy} from "@libs/lambda";
import schema from "./schema";
import {ddbDocClient} from "@libs/aws-client";
import {GSIs} from "../gsi-index";
import {Tenant} from "@models/tenant";
import { QueryCommand } from "@aws-sdk/lib-dynamodb";

const handler: ValidatedEventAPIGatewayProxyEvent<typeof schema> = async (event) => {
  const { status }: {[key: string]: any} = event.queryStringParameters;
  const { GSI2PK } = Tenant.BuildGSIKeys();

  const result = await ddbDocClient.send(new QueryCommand({
    TableName: process.env.TENANT_TABLE_NAME,
    IndexName: GSIs.GSI2 ,
    KeyConditionExpression: 'GSI2PK = :gsi2pk',
    FilterExpression: '#status = :status',
    ExpressionAttributeValues: {
      ':gsi2pk': GSI2PK,
      ':status': status,
    },
    ExpressionAttributeNames: {
      '#name': 'name',
      '#status': 'status'
    },
    ProjectionExpression: 'id, email, #name'
  }));

  const tenants = result.Items.map(item => item as Tenant);

  return formatJSONResponse({ tenants });
}

export const main = middyfy(handler, schema);