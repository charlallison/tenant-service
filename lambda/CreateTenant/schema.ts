export default {
  type: 'object',
  required: ['body'],
  properties: {
    body: {
      type: 'object',
      required: ['name', 'phone'],
      properties: {
        name: {type: 'string'},
        phone: {type: 'string'}
      }
    }
  }
} as const