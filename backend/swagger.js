const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Flight Booking System API',
      version: '1.0.0',
      description: 'A comprehensive API for flight booking system with real-time updates',
      contact: {
        name: 'API Support',
        email: 'support@flightbooking.com'
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
          bearerFormat: 'JWT'
        }
      },
      schemas: {
        Flight: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            flight_number: { type: 'string' },
            airline: { type: 'string' },
            origin: { type: 'string' },
            destination: { type: 'string' },
            departure_time: { type: 'string', format: 'date-time' },
            arrival_time: { type: 'string', format: 'date-time' },
            price: { type: 'number' },
            available_seats: { type: 'integer' },
            cabin_class: { type: 'string', enum: ['Economy', 'Premium Economy', 'Business', 'First'] }
          }
        },
        Booking: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            user_id: { type: 'string' },
            flight_id: { type: 'string' },
            passenger_count: { type: 'integer' },
            total_price: { type: 'number' },
            status: { type: 'string', enum: ['confirmed', 'cancelled', 'pending'] },
            passenger_info: { type: 'object' }
          }
        },
        User: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            name: { type: 'string' },
            email: { type: 'string' },
            phone: { type: 'string' },
            role: { type: 'string', enum: ['user', 'admin'] }
          }
        }
      }
    }
  },
  apis: ['./routes/*.js', './controllers/*.js']
};

const specs = swaggerJsdoc(options);

module.exports = specs; 