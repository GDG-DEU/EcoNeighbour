import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { Express } from 'express';

const port = parseInt(process.env.PORT || '5000', 10);
const baseUrl = `http://localhost:${port}`;

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'EcoNeighbour API',
      version: '1.0.0',
      description: 'EcoNeighbour Backend API Documentation',
    },
    servers: [
      {
        url: baseUrl,
        description: 'Development server',
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
  // Bu yol, projedeki route veya controller dosyalarını okur
  apis: ['./src/routes/*.ts', './src/controllers/*.ts'], 
};

const swaggerSpec = swaggerJsdoc(options);

export const setupSwagger = (app: Express) => {
  const swaggerOptions = {
    url: '/api-docs/swagger.json',
    dom_id: '#swagger-ui',
    deepLinking: true,
  };

  app.get('/api-docs/swagger.json', (_req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
  });

  app.use(
    '/api-docs',
    swaggerUi.serve,
    swaggerUi.setup(swaggerSpec, { swaggerOptions })
  );
  console.log(`📄 Swagger dökümantasyonu hazır: ${baseUrl}/api-docs`);
};
