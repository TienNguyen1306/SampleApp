// OpenAPI 3.0 configuration — spec generated from JSDoc (@swagger) in
// backend/routes/*.js and backend/app.js (health check).
// UI: /api-docs — raw JSON: /api-docs.json

import swaggerJsdoc from 'swagger-jsdoc'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const definition = {
  openapi: '3.0.3',
  info: {
    title: 'ShopVN API',
    version: '1.0.0',
    description:
      'API documentation for ShopVN — a sample e-commerce app (Express 5 + MongoDB).\n\n' +
      'Response format: success returns the object/array directly (or `{ message }` for delete); ' +
      'error returns `{ errorCode, message }`.',
  },
  servers: [
    { url: '/api', description: 'Relative (via Vite proxy or same origin)' },
  ],
  tags: [
    { name: 'Auth', description: 'Register / login / current user info' },
    { name: 'Products', description: 'Product listing and management' },
    { name: 'Orders', description: 'Place orders, payment, order history' },
    { name: 'Cart', description: 'Server-synced shopping cart' },
    { name: 'Users', description: 'User administration (admin, requires X-App-Key)' },
    { name: 'Profile', description: 'Current user profile info & updates' },
    { name: 'Health', description: 'Health check' },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'JWT issued on login/register. Header: `Authorization: Bearer <token>`',
      },
      appKeyAuth: {
        type: 'apiKey',
        in: 'header',
        name: 'X-App-Key',
        description: 'Required for all `/api/users/*` endpoints. Must match `APP_SECRET` server-side.',
      },
    },
    schemas: {
      Error: {
        type: 'object',
        properties: {
          errorCode: { type: 'string', example: 'NOT_FOUND' },
          message: { type: 'string', example: 'Not found' },
        },
      },
      User: {
        type: 'object',
        properties: {
          id: { type: 'string', example: '65f0a1b2c3d4e5f678901234' },
          username: { type: 'string', example: 'customer' },
          name: { type: 'string', example: 'Nguyễn Văn A' },
          role: { type: 'string', enum: ['admin', 'customer'], example: 'customer' },
          avatar: { type: 'string', nullable: true, description: 'Base64 data URI or null' },
        },
      },
      Product: {
        type: 'object',
        properties: {
          _id: { type: 'string', example: '65f0a1b2c3d4e5f678901234' },
          name: { type: 'string', example: 'Phở' },
          price: { type: 'number', example: 45000 },
          emoji: { type: 'string', example: '🍜' },
          tag: { type: 'string', example: 'best-seller' },
          category: { type: 'string', example: 'food' },
          stock: { type: 'number', example: 20 },
        },
      },
      OrderItem: {
        type: 'object',
        properties: {
          productId: { type: 'string', example: '65f0a1b2c3d4e5f678901234' },
          name: { type: 'string', example: 'Phở' },
          price: { type: 'number', example: 45000 },
          quantity: { type: 'number', minimum: 1, example: 2 },
          emoji: { type: 'string', example: '🍜' },
        },
      },
      Order: {
        type: 'object',
        properties: {
          _id: { type: 'string' },
          id: { type: 'string', description: 'Virtual field = _id.toString()' },
          userId: { type: 'string' },
          items: { type: 'array', items: { '$ref': '#/components/schemas/OrderItem' } },
          recipientName: { type: 'string', example: 'Nguyễn Văn A' },
          recipientPhone: { type: 'string', example: '0901234567' },
          address: { type: 'string', example: '123 Lê Lợi, Q1' },
          paymentMethod: { type: 'string', enum: ['cash', 'card'], example: 'cash' },
          paymentIntentId: { type: 'string', nullable: true, example: null },
          totalPrice: { type: 'number', example: 90000 },
          status: {
            type: 'string',
            enum: ['pending', 'confirmed', 'shipped', 'delivered'],
            example: 'confirmed',
          },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
      CartItem: {
        type: 'object',
        properties: {
          productId: { type: 'string', example: '65f0a1b2c3d4e5f678901234' },
          name: { type: 'string', example: 'Phở' },
          price: { type: 'number', example: 45000 },
          quantity: { type: 'number', example: 2 },
          emoji: { type: 'string', example: '🍜' },
        },
      },
      Pagination: {
        type: 'object',
        properties: {
          page: { type: 'number', example: 1 },
          limit: { type: 'number', example: 10 },
          total: { type: 'number', example: 42 },
          totalPages: { type: 'number', example: 5 },
        },
      },
    },
  },
}

// glob (used by swagger-jsdoc) requires forward-slash paths, even on Windows
const toGlobPath = (p) => p.split('\\').join('/')

const options = {
  definition,
  // Scan @swagger JSDoc comments in route files + app.js (health check)
  apis: [toGlobPath(join(__dirname, 'routes', '*.js')), toGlobPath(join(__dirname, 'app.js'))],
}

export const swaggerSpec = swaggerJsdoc(options)
