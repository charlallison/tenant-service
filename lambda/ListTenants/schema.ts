export default {
  type: 'object',
  required: ['queryStringParameters'],
  properties: {
    queryStringParameters: {
      type: ['object', 'null'],
      required: ['status'],
      default: { status: 'active' },
      properties: {
        status: {
          type: 'string',
          enum: ['active', 'inactive']
        }
      },
    }
  }
} as const