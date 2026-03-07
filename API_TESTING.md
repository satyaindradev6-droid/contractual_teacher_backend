# API Testing Guide

## Base URL
```
http://localhost:7000
```

## 1. Registration Endpoint

### POST /api/auth/register

**Request Body:**
```json
{
  "first_name": "Satya",
  "middle_name": "Indra",
  "last_name": "Dev",
  "date_of_birth": "2000-05-10",
  "mobile_no": "9876543210",
  "email": "satya@example.com"
}
```

**Password Generation:**
- Auto-generated: `FIRST_NAME (uppercase) + DOB YEAR`
- Example: `SATYA2000`

**Success Response (201):**
```json
{
  "success": true,
  "message": "User registered successfully"
}
```

**Error Responses:**
- 400: Missing required fields
- 400: Mobile number already exists
- 400: Email already exists

---

## 2. Login Endpoint

### POST /api/auth/login

**Request Body:**
```json
{
  "mobile_no": "9876543210",
  "password": "SATYA2000"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**JWT Token Details:**
- Payload: `{ userId, mobile_no }`
- Secret: `process.env.JWT_SECRET`
- Expiry: 1 day

**Error Responses:**
- 400: Missing required fields
- 401: User not found
- 401: Invalid password

---

## 3. User Profile Endpoint (Protected)

### GET /api/user/profile

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
```

**Success Response (200):**
```json
{
  "id": "1",
  "first_name": "Satya",
  "middle_name": "Indra",
  "last_name": "Dev",
  "mobile_no": "9876543210",
  "email": "satya@example.com",
  "date_of_birth": "2000-05-10"
}
```

**Error Responses:**
- 401: Access token required
- 403: Invalid or expired token
- 404: User not found

---

## Testing with cURL

### Register User
```bash
curl -X POST http://localhost:7000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "first_name": "Satya",
    "middle_name": "Indra",
    "last_name": "Dev",
    "date_of_birth": "2000-05-10",
    "mobile_no": "9876543210",
    "email": "satya@example.com"
  }'
```

### Login
```bash
curl -X POST http://localhost:7000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "mobile_no": "9876543210",
    "password": "SATYA2000"
  }'
```

### Get Profile (replace TOKEN with actual token)
```bash
curl -X GET http://localhost:7000/api/user/profile \
  -H "Authorization: Bearer TOKEN"
```

---

## Security Features

✅ Password hashing using bcrypt (salt rounds: 10)
✅ JWT authentication with 1-day expiry
✅ Password excluded from all API responses
✅ Input validation on all endpoints
✅ Unique constraints on mobile_no and email
✅ Protected routes with token verification

---

## Environment Variables

Make sure your `.env` file contains:
```
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
DATABASE_URL="postgresql://..."
PORT=7000
```
