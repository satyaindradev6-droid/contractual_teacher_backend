# Profile Endpoint Testing Guide

## Correct Endpoint
The profile endpoint is at: `GET /api/user/profile`

## Steps to Test

### 1. Login First
```bash
POST http://localhost:8000/api/auth/login
Content-Type: application/json

{
  "mobile_no": "your_mobile_number",
  "password": "your_password"
}
```

Response will include:
```json
{
  "success": true,
  "token": "eyJhbGc...",
  "application_id": "1"
}
```

### 2. Get Profile
```bash
GET http://localhost:8000/api/user/profile
Authorization: Bearer YOUR_TOKEN_HERE
```

## Common Issues

### Issue 1: Wrong Endpoint
- ❌ Wrong: `/api/auth/profile`
- ✅ Correct: `/api/user/profile`

### Issue 2: Missing Authorization Header
Make sure to include the Bearer token:
```
Authorization: Bearer eyJhbGc...
```

### Issue 3: Token Expired
Tokens expire after 1 day. Login again to get a new token.

### Issue 4: User Not Found
The token contains the `application_id`. If the user doesn't exist in the database, you'll get a 404 error.

## Testing with cURL

```bash
# 1. Login
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"mobile_no":"1234567890","password":"password123"}'

# 2. Get Profile (replace TOKEN with actual token from login)
curl -X GET http://localhost:8000/api/user/profile \
  -H "Authorization: Bearer TOKEN"
```

## Expected Response Structure

```json
{
  "success": true,
  "data": {
    "application_id": "1",
    "first_name": "John",
    "middle_name": null,
    "last_name": "Doe",
    "date_of_birth": "1990-01-01",
    "gender": 1,
    "email": "john@example.com",
    "mobile_no": "1234567890",
    "academic_details": [],
    "experience_details": [],
    "school_post_choices": [],
    "upload_documents": [],
    "application_trackers": []
  }
}
```
