# Math API Documentation

## Overview

The Math API is a RESTful web service that provides various mathematical operations with JWT-based authentication. This documentation provides comprehensive information about all available endpoints, request/response formats, and usage examples.

## Base URL

```
http://localhost:3000
```

## Authentication

All math endpoints require JWT authentication. Obtain a token from the `/auth/login` endpoint and include it in the `Authorization` header for subsequent requests.

### Authentication Flow

1. **Login**: POST to `/auth/login` with credentials
2. **Receive Token**: Get JWT token from response
3. **Use Token**: Include token in `Authorization: Bearer <token>` header

## Interactive Documentation

Visit **[http://localhost:3000/api-docs](http://localhost:3000/api-docs)** for interactive Swagger documentation where you can:

- View all endpoints with detailed schemas
- Test API calls directly in your browser
- Authenticate and try protected endpoints
- View request/response examples

## Endpoints Overview

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/` | API information | No |
| POST | `/auth/login` | Authenticate and get JWT token | No |
| GET | `/math/calculate` | Basic math operations (2 numbers) | Yes |
| POST | `/math/calculate` | Array operations (multiple numbers) | Yes |
| PUT | `/math/power` | Power calculations (base^exponent) | Yes |
| GET | `/math/factorial` | Factorial calculations | Yes |

## Detailed Endpoint Documentation

### 1. Root Information
```http
GET /
```
Returns API information and available endpoints. No authentication required.

**Response:**
```json
{
  "message": "Math API Server",
  "version": "1.0.0",
  "endpoints": {
    "auth": "POST /auth/login",
    "calculate_get": "GET /math/calculate",
    "calculate_post": "POST /math/calculate",
    "power": "PUT /math/power",
    "factorial": "GET /math/factorial"
  },
  "documentation": {
    "swagger": "/api-docs",
    "readme": "README.md",
    "postman": "POSTMAN_TROUBLESHOOTING.md"
  }
}
```

### 2. Authentication

#### Login
```http
POST /auth/login
Content-Type: application/json
```

**Request Body:**
```json
{
  "username": "admin",
  "password": "password"
}
```

**Success Response (200):**
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresIn": "24h"
}
```

**Error Responses:**
- `400`: Missing username or password
- `401`: Invalid credentials
- `500`: Internal server error

### 3. Basic Math Operations (GET)

```http
GET /math/calculate?operation={op}&a={num1}&b={num2}
Authorization: Bearer <token>
```

**Parameters:**
- `operation`: `add`, `subtract`, `multiply`, `divide`
- `a`: First number (required)
- `b`: Second number (required)

**Example:**
```http
GET /math/calculate?operation=add&a=10&b=5
```

**Response:**
```json
{
  "operation": "add",
  "operands": { "a": 10, "b": 5 },
  "result": 15,
  "timestamp": "2025-11-02T12:00:00.000Z"
}
```

**Error Cases:**
- Division by zero returns 400 error
- Invalid operation returns 400 error
- Non-numeric values return 400 error

### 4. Array Math Operations (POST)

```http
POST /math/calculate
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "operation": "sum",
  "numbers": [1, 2, 3, 4, 5]
}
```

**Supported Operations:**
- `sum`: Add all numbers
- `product`: Multiply all numbers
- `average`: Calculate mean
- `max`: Find maximum value
- `min`: Find minimum value

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

### 5. Power Operations (PUT)

```http
PUT /math/power
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
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

### 6. Factorial Operations (GET)

```http
GET /math/factorial?n={number}
Authorization: Bearer <token>
```

**Parameters:**
- `n`: Non-negative integer (0-170)

**Example:**
```http
GET /math/factorial?n=5
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

**Limitations:**
- Maximum input: 170 (to prevent overflow)
- Only non-negative integers accepted

## Error Handling

The API uses standard HTTP status codes:

| Code | Description |
|------|-------------|
| 200 | Success |
| 400 | Bad Request (invalid parameters) |
| 401 | Unauthorized (missing token) |
| 403 | Forbidden (invalid/expired token) |
| 404 | Not Found (invalid endpoint) |
| 500 | Internal Server Error |

**Error Response Format:**
```json
{
  "error": "Description of the error"
}
```

## Authentication Details

### JWT Token
- **Algorithm**: HS256
- **Expiration**: 24 hours
- **Header Format**: `Authorization: Bearer <token>`

### Default Credentials
- **Username**: `admin`
- **Password**: `password`

> ⚠️ **Security Note**: Change default credentials in production!

## Rate Limiting

Currently no rate limiting is implemented. Consider adding rate limiting for production use.

## CORS Policy

The API accepts requests from all origins (`*`). Configure appropriately for production.

## Testing

### Using curl
```bash
# Login
TOKEN=$(curl -s -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "password"}' | \
  jq -r '.token')

# Use the token
curl -X GET "http://localhost:3000/math/calculate?operation=add&a=5&b=3" \
  -H "Authorization: Bearer $TOKEN"
```

### Using Postman
1. Import the collection (see POSTMAN_TROUBLESHOOTING.md)
2. Set up environment variables
3. Use the interactive Swagger docs at `/api-docs`

### Test Script
Run the included test script:
```bash
./test-api.sh
```

## Development

### Running the Server
```bash
npm start          # Production
npm run dev        # Development with nodemon
```

### Environment Variables
```bash
NODE_ENV=development
PORT=3000
JWT_SECRET=your_secret_key
```

## Support

- **Interactive Docs**: [http://localhost:3000/api-docs](http://localhost:3000/api-docs)
- **Postman Help**: See `POSTMAN_TROUBLESHOOTING.md`
- **README**: See `README.md` for setup instructions

---

**Version**: 1.0.0  
**Last Updated**: November 2025