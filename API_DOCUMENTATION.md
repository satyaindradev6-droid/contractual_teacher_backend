# Authentication API Documentation

## Base URL
```
http://localhost:7000/api/auth
```

## Endpoints

### 1. Register User
**POST** `/api/auth/register`

Register a new user with mobile number, email, and password.

**Request Body:**
```json
{
  "mobile_no": "9876543210",
  "email": "user@example.com",
  "password": "securePassword123",
  "name": "John Doe",
  "date_of_birth": "1990-01-01",
  "gender": 1,
  "category": 1,
  "marital_status": 1,
  "contact_address": "123 Main Street",
  "city": "Mumbai",
  "state": "Maharashtra",
  "district": "Mumbai"
}
```

**Required Fields:**
- `mobile_no` (string)
- `email` (string)
- `password` (string)

**Response (201):**
```json
{
  "message": "Registration successful",
  "user": {
    "id": "1",
    "mobile_no": "9876543210",
    "email": "user@example.com",
    "name": "John Doe",
    "status": 1,
    "created_at": "2024-01-01T00:00:00.000Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

### 2. Login User
**POST** `/api/auth/login`

Login with mobile number and password.

**Request Body:**
```json
{
  "mobile_no": "9876543210",
  "password": "securePassword123"
}
```

**Response (200):**
```json
{
  "message": "Login successful",
  "user": {
    "id": "1",
    "mobile_no": "9876543210",
    "email": "user@example.com",
    "name": "John Doe",
    "status": 1
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

### 3. Get User Details
**GET** `/api/auth/user`

Get authenticated user details (requires token).

**Headers:**
```
Authorization: Bearer <your-jwt-token>
```

**Response (200):**
```json
{
  "user": {
    "id": "1",
    "mobile_no": "9876543210",
    "email": "user@example.com",
    "name": "John Doe",
    "date_of_birth": "1990-01-01T00:00:00.000Z",
    "gender": 1,
    "category": 1,
    "marital_status": 1,
    "contact_address": "123 Main Street",
    "city": "Mumbai",
    "state": "Maharashtra",
    "district": "Mumbai",
    "status": 1,
    "created_at": "2024-01-01T00:00:00.000Z"
  }
}
```

---

## Error Responses

### 400 Bad Request
```json
{
  "error": "Mobile number, email, and password are required"
}
```

### 401 Unauthorized
```json
{
  "error": "Invalid credentials"
}
```

### 403 Forbidden
```json
{
  "error": "Invalid or expired token"
}
```

### 404 Not Found
```json
{
  "error": "User not found"
}
```

### 500 Internal Server Error
```json
{
  "error": "Registration failed"
}
```

---

## Testing with cURL

### Register
```bash
curl -X POST http://localhost:7000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "mobile_no": "9876543210",
    "email": "test@example.com",
    "password": "password123",
    "name": "Test User"
  }'
```

### Login
```bash
curl -X POST http://localhost:7000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "mobile_no": "9876543210",
    "password": "password123"
  }'
```

### Get User Details
```bash
curl -X GET http://localhost:7000/api/auth/user \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## Security Features

- Passwords are hashed using bcrypt with salt rounds of 10
- JWT tokens expire after 7 days
- Passwords are never returned in API responses
- Token-based authentication for protected routes
