export default {
  type: 'object',
  required: ['queryStringParameters'],
  properties: {
    queryStringParameters: {
      type: ['object', 'null'],
      required: ['status'],
      default: { status: 'Available' },
      properties: {
        status: {
          type: 'string',
          enum: ['Available', 'Not Available']
        }
      },
    }
  }
} as const