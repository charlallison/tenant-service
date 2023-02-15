import middy from "@middy/core"
import jsonBodyParser from "@middy/http-json-body-parser"

export const middyfy = (handler) => {
  return middy(handler).use(jsonBodyParser())
}
