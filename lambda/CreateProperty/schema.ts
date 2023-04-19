export default {
  type: 'object',
  required: ['body'],
  properties: {
    body: {
      type: 'object',
      required: ['address', 'cost', 'rooms', 'city', 'state'],
      properties: {
        address : { type: 'string'},
        cost: { type: 'integer'},
        rooms: { type: 'integer'},
        city: { type: 'string'},
        state: { type: 'string'}
      }
    }
  }
} as const