export default {
  type: 'object',
  required: ['queryStringParameters'],
  properties: {
    queryStringParameters: {
      type: ['object', 'null'],
      required: ['status'],
      default: { status: 'Active' },
      properties: {
        status: {
          type: 'string',
          enum: ['Active', 'Inactive']
        }
      },
    }
  }
} as const