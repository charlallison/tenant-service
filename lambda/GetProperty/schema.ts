export default {
  type: 'object',
  required: ['pathParameters'],
  properties: {
    pathParameters: {
      type: 'object',
      required: ["id"],
      properties: {
        id: { type: 'string'}
      }
    }
  }
} as const