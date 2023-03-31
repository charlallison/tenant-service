export default {
  type: 'object',
  required: ['body'],
  properties: {
    body: {
      type: 'object',
      required: ['name', 'phone', 'propertyId', 'amountPaid'],
      properties: {
        name: {type: 'string'},
        phone: {type: 'string'},
        propertyId: { type: 'string'},
        amountPaid: { type: 'integer'}
      }
    }
  }
} as const