export default {
  type: 'object',
  required: ['body', 'pathParameters'],
  properties: {
    body: {
      type: 'object',
      required: ['title', 'description'],
      properties: {
        title: { type: 'string'},
        description: { type: 'string'}
      }
    },
    pathParameters: {
      type: 'object',
      required: ['id'],
      properties: {
        id: { type: 'string'}
      }
    }
  }
} as const