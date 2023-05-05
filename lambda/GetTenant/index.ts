import {formatJSONResponse, ValidatedEventAPIGatewayProxyEvent} from "@libs/api-gateway";
import schema from "./schema";
import {middyfy} from "@libs/lambda";
import {NotFound} from "http-errors";
import {getTenantById} from "../util-tenant";

const handler: ValidatedEventAPIGatewayProxyEvent<typeof schema> = async (event) => {
  const { id} = event.pathParameters;

  const tenant = await getTenantById(id)

  if(!tenant) {
    const {message, statusCode} = new NotFound(`Tenant not found`);
    return formatJSONResponse({message}, statusCode)
  }

  return formatJSONResponse({...tenant});
}

export const main = middyfy(handler, schema)