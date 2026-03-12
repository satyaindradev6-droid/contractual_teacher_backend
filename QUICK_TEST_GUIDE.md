# Quick Test Guide for Enhanced Authentication System

## Prerequisites

1. Make sure your server is running:
```bash
npm run dev
```

2. Ensure you have a test user in your database with these details:
- mobile_no: "9876543210"
- email: "test@example.com" 
- date_of_birth: "1990-01-01"
- password: "testPassword123"

## Manual Testing Steps

### Step 1: Login and Get Token
```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "mobile_no": "9876543210",
    "password": "testPassword123"
  }'
```

Save the returned token for next steps.

### Step 2: Access Protected Route
```bash
curl -X GET http://localhost:8000/api/auth/profile \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

This should return user profile data.

### Step 3: Reset Password
```bash
curl -X POST http://localhost:8000/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{
    "mobile_no": "9876543210",
    "email": "test@example.com",
    "date_of_birth": "1990-01-01",
    "new_password": "newPassword456"
  }'
```

### Step 4: Try Old Token (Should Fail)
```bash
curl -X GET http://localhost:8000/api/auth/profile \
  -H "Authorization: Bearer YOUR_OLD_TOKEN_HERE"
```

This should return a 401 error with message: "Session expired due to password reset. Please login again."

### Step 5: Login with New Password
```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "mobile_no": "9876543210",
    "password": "newPassword456"
  }'
```

### Step 6: Access Protected Route with New Token
```bash
curl -X GET http://localhost:8000/api/auth/profile \
  -H "Authorization: Bearer YOUR_NEW_TOKEN_HERE"
```

This should work successfully.

## Automated Testing

Run the automated test script:
```bash
node test-auth-system.js
```

## Expected Behavior

✅ **Login works** - Returns JWT token with updated_at timestamp
✅ **Protected routes work** - Access granted with valid token  
✅ **Password reset works** - Updates password and updated_at field
❌ **Old tokens rejected** - Returns 401 after password reset
✅ **New login works** - Can login with new password
✅ **New tokens work** - Access granted with new token

## Troubleshooting

### Common Issues:

1. **"User not found"** - Check if test user exists in database
2. **"Invalid password"** - Verify password is correct
3. **"Access token required"** - Include Authorization header
4. **"Invalid or expired token"** - Check token format and expiration

### Debug Mode:

Check server logs for detailed authentication information when requests fail.

## Security Notes

- Tokens expire after 24 hours (configurable via JWT_EXPIRES_IN)
- Password reset immediately invalidates all existing sessions
- No database schema changes required
- Uses existing updated_at field for session tracking