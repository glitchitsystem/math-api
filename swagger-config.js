const swaggerJSDoc = require('swagger-jsdoc');

const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'Math API',
    version: '1.0.0',
    description: 'A simple Express.js REST API for performing various mathematical operations with JWT-based authentication.',
    contact: {
      name: 'API Support',
      email: 'support@mathapi.com'
    },
    license: {
      name: 'ISC',
      url: 'https://opensource.org/licenses/ISC'
    }
  },
  servers: [
    {
      url: 'http://localhost:3000',
      description: 'Development server'
    }
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Enter JWT token obtained from /auth/login'
      }
    },
    schemas: {
      LoginRequest: {
        type: 'object',
        required: ['username', 'password'],
        properties: {
          username: {
            type: 'string',
            example: 'admin',
            description: 'Username for authentication'
          },
          password: {
            type: 'string',
            example: 'password',
            description: 'Password for authentication'
          }
        }
      },
      LoginResponse: {
        type: 'object',
        properties: {
          message: {
            type: 'string',
            example: 'Login successful'
          },
          token: {
            type: 'string',
            example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
          },
          expiresIn: {
            type: 'string',
            example: '24h'
          }
        }
      },
      BasicCalculationRequest: {
        type: 'object',
        required: ['operation', 'numbers'],
        properties: {
          operation: {
            type: 'string',
            enum: ['sum', 'product', 'average', 'max', 'min'],
            example: 'sum',
            description: 'Mathematical operation to perform'
          },
          numbers: {
            type: 'array',
            items: {
              type: 'number'
            },
            example: [1, 2, 3, 4, 5],
            description: 'Array of numbers to calculate'
          }
        }
      },
      PowerRequest: {
        type: 'object',
        required: ['base', 'exponent'],
        properties: {
          base: {
            type: 'number',
            example: 2,
            description: 'Base number for power calculation'
          },
          exponent: {
            type: 'number',
            example: 3,
            description: 'Exponent for power calculation'
          }
        }
      },
      CalculationResponse: {
        type: 'object',
        properties: {
          operation: {
            type: 'string',
            example: 'add'
          },
          result: {
            type: 'number',
            example: 8
          },
          timestamp: {
            type: 'string',
            format: 'date-time',
            example: '2025-11-02T12:00:00.000Z'
          }
        }
      },
      ErrorResponse: {
        type: 'object',
        properties: {
          error: {
            type: 'string',
            example: 'Description of the error'
          }
        }
      }
    }
  },
  security: [
    {
      bearerAuth: []
    }
  ]
};

const options = {
  swaggerDefinition,
  apis: ['./server.js', './swagger-docs/*.js'], // Path to the API files
};

const swaggerSpec = swaggerJSDoc(options);

module.exports = swaggerSpec;