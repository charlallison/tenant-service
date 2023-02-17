export default {
  type: 'object',
  properties: {
    name: { type: 'string'},
    phone: { type: 'string'},
    propertyType: { type: 'string'},
    propertyCost: { type: 'number'},
    amountPaid: { type: 'number'}
  },
  required: ['name', 'phone', 'propertyType', 'propertyCost', 'amountPaid']
} as const