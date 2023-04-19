export default {
  type: 'object',
  required: ['body'],
  properties: {
    body: {
      type: 'object',
      required: ['name', 'phone', 'email'],
      properties: {
        name: {type: 'string'},
        phone: {type: 'string'},
        email: { type: 'string'},

      }
    }
  }
} as const