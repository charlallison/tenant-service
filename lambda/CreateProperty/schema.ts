export default {
  type: 'object',
  required: ['body'],
  properties: {
    body: {
      type: 'object',
      required: ['description', 'cost', 'rooms', 'title'],
      properties: {
        description : { type: 'string'},
        cost: { type: 'integer'},
        rooms: { type: 'integer'},
        title: { type: 'string'}
      }
    }
  }
} as const