export default {
  type: 'object',
  required: ['body'],
  properties: {
    body: {
      type: 'object',
      required: ['name'],
      properties: {
        name: {type: 'string'}
      }
    }
  }
} as const