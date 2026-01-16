import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Conecta Social API',
      version: '1.0.0',
      description: 'Documentação da API do projeto Conecta Social',
      contact: {
        name: 'Suporte',
        email: 'suporte@conectararos.com.br',
      },
    },
    servers: [
      {
        url: 'http://localhost/api',
        description: 'Servidor Local (Docker/Nginx)',
      },
      {
        url: 'http://localhost:3000/api',
        description: 'Servidor Local (Direto)',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  // Arquivos onde o swagger-jsdoc vai procurar os comentários
  apis: ['./src/presenter/routers/*.ts'], 
};

export const swaggerSpec = swaggerJsdoc(options);
