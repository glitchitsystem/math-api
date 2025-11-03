# Postman Troubleshooting Guide for Math API

If you're getting a 500 error from the `/auth/login` endpoint in Postman, here are the most common causes and solutions:

## 1. Check Your Request Format

### Correct Postman Setup:
- **Method**: POST
- **URL**: `http://localhost:3000/auth/login`
- **Headers**:
  - `Content-Type: application/json`
- **Body** (select "raw" and "JSON"):
```json
{
  "username": "admin", 
  "password": "password"
}
```

## 2. Common Issues and Fixes

### Issue 1: Invalid JSON Format
**Symptom**: 500 Internal Server Error
**Cause**: Malformed JSON in request body
**Fix**: 
- Make sure your JSON is properly formatted
- No trailing commas
- Proper quotes around strings
- Valid JSON structure

### Issue 2: Wrong Content-Type Header
**Symptom**: 500 Internal Server Error  
**Cause**: Missing or incorrect Content-Type header
**Fix**: Add header `Content-Type: application/json`

### Issue 3: Wrong Body Type in Postman
**Symptom**: 500 Internal Server Error
**Cause**: Using form-data or x-www-form-urlencoded instead of raw JSON
**Fix**: In Postman Body tab, select "raw" and set dropdown to "JSON"

### Issue 4: Server Not Running
**Symptom**: Connection refused error
**Cause**: Math API server is not running
**Fix**: Run `npm start` in your project directory

## 3. Step-by-Step Postman Setup

1. **Create New Request**
   - Click "New" → "Request"
   - Name it "Math API Login"

2. **Set Request Method and URL**
   - Method: POST
   - URL: `http://localhost:3000/auth/login`

3. **Add Headers**
   - Click "Headers" tab
   - Add: `Content-Type` = `application/json`

4. **Set Request Body**
   - Click "Body" tab
   - Select "raw" radio button
   - Change dropdown from "Text" to "JSON"
   - Enter:
   ```json
   {
     "username": "admin",
     "password": "password"
   }
   ```

5. **Send Request**
   - Click "Send"
   - Should receive 200 OK with JWT token

## 4. Expected Successful Response

```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresIn": "24h"
}
```

## 5. Debugging Steps

1. **Check Server Logs**: Look at your terminal where you ran `npm start` for error messages

2. **Test with curl First**: 
   ```bash
   curl -X POST http://localhost:3000/auth/login \
     -H "Content-Type: application/json" \
     -d '{"username": "admin", "password": "password"}'
   ```

3. **Verify Server is Running**: 
   ```bash
   curl http://localhost:3000/
   ```

4. **Check Port**: Make sure you're using port 3000 (default) or whatever port you configured

## 6. Alternative Test Requests

If login works, test a protected endpoint:

1. **First get token from login**
2. **Copy the token value** 
3. **Test math endpoint**:
   - Method: GET
   - URL: `http://localhost:3000/math/calculate?operation=add&a=5&b=3`
   - Headers: `Authorization: Bearer YOUR_JWT_TOKEN_HERE`

## 7. Common Postman Mistakes

- ❌ Using form-data instead of raw JSON
- ❌ Forgetting Content-Type header  
- ❌ Invalid JSON syntax (trailing commas, unquoted keys)
- ❌ Wrong URL (missing /auth/login)
- ❌ Wrong HTTP method (GET instead of POST)
- ❌ Server not running on port 3000

## 8. If Nothing Works

1. Restart your server: `npm start`
2. Check server logs for detailed error messages
3. Try the curl command first to isolate if it's a Postman issue
4. Verify your .env file exists and has JWT_SECRET
5. Make sure all dependencies are installed: `npm install`

The server now includes better error handling and debug logging to help identify the exact issue.