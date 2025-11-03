# Math API

A simple Express.js REST API for performing various mathematical operations with JWT-based authentication.

## Features

- JWT-based authentication
- Multiple math operations (addition, subtraction, multiplication, division, power, factorial)
- GET, POST, and PUT endpoints
- Input validation and error handling
- CORS and security headers with Helmet
- Environment-based configuration

## Installation

1. Clone the repository:
```bash
git clone https://github.com/glitchitsystem/math-api.git
cd math-api
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:
```bash
cp .env.example .env
# Edit .env file with your configuration
```

4. Start the server:
```bash
npm start
```

The server will run on `http://localhost:3000` by default.

## Authentication

All math endpoints require authentication. First, obtain a JWT token by logging in.

### Login
```http
POST /auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "password"
}
```

**Response:**
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresIn": "24h"
}
```

### Using the Token

Include the token in the Authorization header for all protected endpoints:
```http
Authorization: Bearer YOUR_JWT_TOKEN
```

## API Endpoints

### Root Endpoint
```http
GET /
```
Returns API information and available endpoints.

### Math Operations

#### Basic Calculator (GET)
```http
GET /math/calculate?operation=add&a=5&b=3
Authorization: Bearer YOUR_JWT_TOKEN
```

**Supported operations:** `add`, `subtract`, `multiply`, `divide`

**Response:**
```json
{
  "operation": "add",
  "operands": { "a": 5, "b": 3 },
  "result": 8,
  "timestamp": "2025-11-02T12:00:00.000Z"
}
```

#### Array Operations (POST)
```http
POST /math/calculate
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "operation": "sum",
  "numbers": [1, 2, 3, 4, 5]
}
```

**Supported operations:** `sum`, `product`, `average`, `max`, `min`

**Response:**
```json
{
  "operation": "sum",
  "numbers": [1, 2, 3, 4, 5],
  "result": 15,
  "count": 5,
  "timestamp": "2025-11-02T12:00:00.000Z"
}
```

#### Power Operations (PUT)
```http
PUT /math/power
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "base": 2,
  "exponent": 3
}
```

**Response:**
```json
{
  "operation": "power",
  "base": 2,
  "exponent": 3,
  "result": 8,
  "expression": "2^3",
  "timestamp": "2025-11-02T12:00:00.000Z"
}
```

#### Factorial (GET)
```http
GET /math/factorial?n=5
Authorization: Bearer YOUR_JWT_TOKEN
```

**Response:**
```json
{
  "operation": "factorial",
  "input": 5,
  "result": 120,
  "expression": "5!",
  "timestamp": "2025-11-02T12:00:00.000Z"
}
```

## Error Responses

The API returns appropriate HTTP status codes and error messages:

```json
{
  "error": "Description of the error"
}
```

Common status codes:
- `400` - Bad Request (invalid parameters)
- `401` - Unauthorized (missing or invalid token)
- `403` - Forbidden (token expired)
- `404` - Not Found (endpoint doesn't exist)
- `500` - Internal Server Error

## Example Usage with curl

1. **Login to get token:**
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "password"}'
```

2. **Use the token for math operations:**
```bash
# Basic calculation
curl -X GET "http://localhost:3000/math/calculate?operation=add&a=10&b=5" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Array operations
curl -X POST http://localhost:3000/math/calculate \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"operation": "average", "numbers": [10, 20, 30, 40, 50]}'

# Power operation
curl -X PUT http://localhost:3000/math/power \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"base": 3, "exponent": 4}'

# Factorial
curl -X GET "http://localhost:3000/math/factorial?n=6" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Development

### Running in Development Mode
```bash
npm run dev
```

### Available Scripts
- `npm start` - Start the production server
- `npm run dev` - Start with nodemon for development

### Environment Variables
- `NODE_ENV` - Environment (development/production)
- `PORT` - Server port (default: 3000)
- `JWT_SECRET` - Secret key for JWT tokens

## Security Notes

1. Change the default JWT secret in production
2. Use HTTPS in production
3. The default user credentials are for demonstration only
4. In production, use a proper database for user management
5. Consider implementing rate limiting for production use

## License

ISC