import middy from "@middy/core"
import jsonBodyParser from "@middy/http-json-body-parser";
import httpErrorHandler from "@middy/http-error-handler";
import validator from "@middy/validator";
import {transpileSchema} from "@middy/validator/transpile";

export const middyfy = (handler, schema={}) => {
  return middy(handler)
    .use(jsonBodyParser())
    .use(validator({eventSchema: transpileSchema(schema)}))
    .use(httpErrorHandler());
}
