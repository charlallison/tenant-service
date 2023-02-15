export default {
  type: 'object',
  properties: {
    name: { type: 'string'},
    phone: { type: 'string'}
  },
  required: ['name', 'phone']
} as const