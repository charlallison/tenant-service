export default {
  type: 'object',
  required: ['body'],
  properties: {
    body: {
      type: 'object',
      required: ['cost', 'rooms'],
      properties: {
        cost: { type: 'number'},
        rooms: { type: 'number'}
      }
    }
  }
} as const