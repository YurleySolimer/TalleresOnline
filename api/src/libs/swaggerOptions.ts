export const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Talleres Online API',
      version: '2.0',
      description: 'Talleres Online application',
    },
    servers: [
      {
        url: 'http://localhost:3000',
      },
    ],
  },
  apis: ['./src/routes/*/*.ts'],
}
