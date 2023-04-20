export default {
  type: 'object',
  required: ['queryStringParameters'],
  properties: {
    queryStringParameters: {
      type: 'object',
      required: ['id', 'email'],
      properties: {
        id: { type: 'string'},
        email: { type: 'string'}
      }
    }
  }
} as const