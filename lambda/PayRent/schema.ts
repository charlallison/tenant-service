export default {
  type: 'object',
  required: ['body'],
  properties: {
    body: {
      type: 'object',
      required: ['amount'],
      properties: {
        amount: {type: 'number'},
        propertyId: {type: 'string'}
      }
    }
  }
} as const