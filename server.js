require('dotenv').config();
const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const cors = require('cors');
const helmet = require('helmet');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./swagger-config');

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_key';

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json({
  limit: '10mb',
  type: 'application/json'
}));

// JSON parsing error handler
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({ 
      error: 'Invalid JSON format in request body',
      details: 'Please check your JSON syntax'
    });
  }
  next(err);
});

// Simple in-memory user storage (in production, use a proper database)
const users = [
  {
    id: 1,
    username: 'admin',
    password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi' // password: 'password'
  }
];

// Auth middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Authenticate user and get JWT token
 *     description: Login with username and password to receive a JWT token for accessing protected endpoints
 *     tags: [Authentication]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LoginResponse'
 *       400:
 *         description: Missing username or password
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Invalid credentials
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
// Auth endpoint - POST /auth/login
app.post('/auth/login', async (req, res) => {
  try {
    console.log('Login attempt:', { 
      body: req.body, 
      contentType: req.headers['content-type'],
      userAgent: req.headers['user-agent']
    });
    
    const { username, password } = req.body;

    if (!username || !password) {
      console.log('Missing credentials:', { username: !!username, password: !!password });
      return res.status(400).json({ error: 'Username and password required' });
    }

    const user = users.find(u => u.username === username);
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user.id, username: user.username },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({ 
      message: 'Login successful',
      token,
      expiresIn: '24h'
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
});

// Math endpoints

/**
 * @swagger
 * /math/calculate:
 *   get:
 *     summary: Perform basic mathematical operations on two numbers
 *     description: Calculate addition, subtraction, multiplication, or division of two numbers
 *     tags: [Math Operations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: operation
 *         required: true
 *         schema:
 *           type: string
 *           enum: [add, subtract, multiply, divide]
 *         description: Mathematical operation to perform
 *         example: add
 *       - in: query
 *         name: a
 *         required: true
 *         schema:
 *           type: number
 *         description: First number
 *         example: 5
 *       - in: query
 *         name: b
 *         required: true
 *         schema:
 *           type: number
 *         description: Second number
 *         example: 3
 *     responses:
 *       200:
 *         description: Calculation completed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 operation:
 *                   type: string
 *                   example: add
 *                 operands:
 *                   type: object
 *                   properties:
 *                     a:
 *                       type: number
 *                       example: 5
 *                     b:
 *                       type: number
 *                       example: 3
 *                 result:
 *                   type: number
 *                   example: 8
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *       400:
 *         description: Missing or invalid parameters
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Invalid or expired token
 */
// GET /math/calculate - Calculate basic operations
app.get('/math/calculate', authenticateToken, (req, res) => {
  try {
    const { operation, a, b } = req.query;

    if (!operation || !a || !b) {
      return res.status(400).json({ 
        error: 'Missing parameters. Required: operation, a, b',
        example: '/math/calculate?operation=add&a=5&b=3'
      });
    }

    const numA = parseFloat(a);
    const numB = parseFloat(b);

    if (isNaN(numA) || isNaN(numB)) {
      return res.status(400).json({ error: 'Parameters a and b must be valid numbers' });
    }

    let result;
    switch (operation.toLowerCase()) {
      case 'add':
        result = numA + numB;
        break;
      case 'subtract':
        result = numA - numB;
        break;
      case 'multiply':
        result = numA * numB;
        break;
      case 'divide':
        if (numB === 0) {
          return res.status(400).json({ error: 'Division by zero is not allowed' });
        }
        result = numA / numB;
        break;
      default:
        return res.status(400).json({ 
          error: 'Invalid operation. Supported: add, subtract, multiply, divide' 
        });
    }

    res.json({
      operation,
      operands: { a: numA, b: numB },
      result,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @swagger
 * /math/calculate:
 *   post:
 *     summary: Perform mathematical operations on arrays of numbers
 *     description: Calculate sum, product, average, max, or min of an array of numbers
 *     tags: [Math Operations]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/BasicCalculationRequest'
 *     responses:
 *       200:
 *         description: Calculation completed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 operation:
 *                   type: string
 *                   example: sum
 *                 numbers:
 *                   type: array
 *                   items:
 *                     type: number
 *                   example: [1, 2, 3, 4, 5]
 *                 result:
 *                   type: number
 *                   example: 15
 *                 count:
 *                   type: number
 *                   example: 5
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *       400:
 *         description: Missing or invalid parameters
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Invalid or expired token
 */
// POST /math/calculate - Calculate with request body
app.post('/math/calculate', authenticateToken, (req, res) => {
  try {
    const { operation, numbers } = req.body;

    if (!operation || !numbers || !Array.isArray(numbers)) {
      return res.status(400).json({ 
        error: 'Missing or invalid parameters. Required: operation (string), numbers (array)',
        example: { operation: 'sum', numbers: [1, 2, 3, 4] }
      });
    }

    if (numbers.length === 0) {
      return res.status(400).json({ error: 'Numbers array cannot be empty' });
    }

    const validNumbers = numbers.filter(n => typeof n === 'number' && !isNaN(n));
    if (validNumbers.length !== numbers.length) {
      return res.status(400).json({ error: 'All elements in numbers array must be valid numbers' });
    }

    let result;
    switch (operation.toLowerCase()) {
      case 'sum':
        result = validNumbers.reduce((acc, num) => acc + num, 0);
        break;
      case 'product':
        result = validNumbers.reduce((acc, num) => acc * num, 1);
        break;
      case 'average':
        result = validNumbers.reduce((acc, num) => acc + num, 0) / validNumbers.length;
        break;
      case 'max':
        result = Math.max(...validNumbers);
        break;
      case 'min':
        result = Math.min(...validNumbers);
        break;
      default:
        return res.status(400).json({ 
          error: 'Invalid operation. Supported: sum, product, average, max, min' 
        });
    }

    res.json({
      operation,
      numbers: validNumbers,
      result,
      count: validNumbers.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @swagger
 * /math/power:
 *   put:
 *     summary: Calculate power operations (base^exponent)
 *     description: Calculate the result of raising a base number to an exponent
 *     tags: [Math Operations]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PowerRequest'
 *     responses:
 *       200:
 *         description: Power calculation completed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 operation:
 *                   type: string
 *                   example: power
 *                 base:
 *                   type: number
 *                   example: 2
 *                 exponent:
 *                   type: number
 *                   example: 3
 *                 result:
 *                   type: number
 *                   example: 8
 *                 expression:
 *                   type: string
 *                   example: "2^3"
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *       400:
 *         description: Missing or invalid parameters
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Invalid or expired token
 */
// PUT /math/power - Calculate power operations
app.put('/math/power', authenticateToken, (req, res) => {
  try {
    const { base, exponent } = req.body;

    if (base === undefined || exponent === undefined) {
      return res.status(400).json({ 
        error: 'Missing parameters. Required: base, exponent',
        example: { base: 2, exponent: 3 }
      });
    }

    const numBase = parseFloat(base);
    const numExponent = parseFloat(exponent);

    if (isNaN(numBase) || isNaN(numExponent)) {
      return res.status(400).json({ error: 'Base and exponent must be valid numbers' });
    }

    const result = Math.pow(numBase, numExponent);

    if (!isFinite(result)) {
      return res.status(400).json({ error: 'Result is not finite' });
    }

    res.json({
      operation: 'power',
      base: numBase,
      exponent: numExponent,
      result,
      expression: `${numBase}^${numExponent}`,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Additional math endpoints

/**
 * @swagger
 * /math/factorial:
 *   get:
 *     summary: Calculate factorial of a number
 *     description: Calculate the factorial (n!) of a given non-negative integer
 *     tags: [Math Operations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: n
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 0
 *           maximum: 170
 *         description: Non-negative integer to calculate factorial for (max 170)
 *         example: 5
 *     responses:
 *       200:
 *         description: Factorial calculated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 operation:
 *                   type: string
 *                   example: factorial
 *                 input:
 *                   type: number
 *                   example: 5
 *                 result:
 *                   type: number
 *                   example: 120
 *                 expression:
 *                   type: string
 *                   example: "5!"
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *       400:
 *         description: Missing or invalid parameter
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Invalid or expired token
 */
// GET /math/factorial
app.get('/math/factorial', authenticateToken, (req, res) => {
  try {
    const { n } = req.query;

    if (!n) {
      return res.status(400).json({ 
        error: 'Missing parameter n',
        example: '/math/factorial?n=5'
      });
    }

    const num = parseInt(n);
    if (isNaN(num) || num < 0 || num > 170) {
      return res.status(400).json({ 
        error: 'n must be a non-negative integer less than or equal to 170' 
      });
    }

    let result = 1;
    for (let i = 2; i <= num; i++) {
      result *= i;
    }

    res.json({
      operation: 'factorial',
      input: num,
      result,
      expression: `${num}!`,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Swagger Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'Math API Documentation'
}));

// Root endpoint
/**
 * @swagger
 * /:
 *   get:
 *     summary: Get API information
 *     description: Returns basic information about the Math API and available endpoints
 *     tags: [Info]
 *     security: []
 *     responses:
 *       200:
 *         description: API information retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Math API Server
 *                 version:
 *                   type: string
 *                   example: 1.0.0
 *                 endpoints:
 *                   type: object
 *                 documentation:
 *                   type: object
 */
app.get('/', (req, res) => {
  res.json({
    message: 'Math API Server',
    version: '1.0.0',
    endpoints: {
      auth: 'POST /auth/login',
      calculate_get: 'GET /math/calculate',
      calculate_post: 'POST /math/calculate',
      power: 'PUT /math/power',
      factorial: 'GET /math/factorial'
    },
    documentation: {
      html: '/docs',
      swagger: '/api-docs',
      readme: 'README.md',
      postman: 'POSTMAN_TROUBLESHOOTING.md'
    }
  });
});

// Serve HTML documentation
app.get('/docs', (req, res) => {
  res.sendFile(__dirname + '/docs.html');
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Math API Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = app;