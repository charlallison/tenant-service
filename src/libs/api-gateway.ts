import type { APIGatewayProxyEvent, APIGatewayProxyResult, Handler } from "aws-lambda"
import type { FromSchema } from "json-schema-to-ts";

type ValidatedAPIGatewayProxyEventQueryParameters<S> = Omit<APIGatewayProxyEvent, 'queryStringParameters'> & { queryStringParameters: FromSchema<S> }
type ValidatedAPIGatewayProxyEvent<S> = Omit<APIGatewayProxyEvent, 'body'> & { body: FromSchema<S> }
type ValidatedAPIGatewayProxyEventPathParameters<S> = Omit<APIGatewayProxyEvent, 'pathParameters'> & { pathParameters: FromSchema<S> }

export type ValidatedEventAPIGatewayProxyEvent<S> = Handler<ValidatedAPIGatewayProxyEvent<S>, APIGatewayProxyResult>
export type ValidatedEventAPIGatewayProxyEventPathParameters<S> = Handler<ValidatedAPIGatewayProxyEventPathParameters<S>, APIGatewayProxyResult>
export type ValidatedEventAPIGatewayProxyEventQueryParameters<S> = Handler<ValidatedAPIGatewayProxyEventQueryParameters<S>, APIGatewayProxyResult>

export const formatJSONResponse = (response: Record<string, unknown>, statusCode = 200, ) => {
  return {
    statusCode,
    body: JSON.stringify(response)
  }
}