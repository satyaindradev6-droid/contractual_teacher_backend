# Enhanced Authentication System Guide

## Overview

This authentication system implements automatic logout of old sessions when a password is reset, without adding any new database columns. It uses the existing `updated_at` field to track password changes and invalidate old JWT tokens.

## Key Features

- **Automatic Session Invalidation**: When a password is reset, all existing JWT tokens become invalid
- **No Database Schema Changes**: Uses existing `updated_at` field
- **Secure Token Validation**: Compares JWT timestamp with database timestamp
- **Express Middleware Integration**: Seamless integration with existing routes

## Implementation Details

### 1. JWT Token Structure

The JWT token now includes:
```typescript
{
  userId: string,           // User's application_id
  mobile_no: string,        // User's mobile number
  updated_at: string,       // ISO timestamp from database
  exp: number,              // Token expiration
  iat: number               // Token issued at
}
```

### 2. Login Flow

When a user logs in:
1. Credentials are validated
2. JWT token is generated with current `updated_at` value
3. Token is returned to client

### 3. Password Reset Flow

When password is reset:
1. User identity is verified using mobile_no + email + date_of_birth
2. Password is hashed and updated
3. `updated_at` field is automatically updated to current timestamp
4. All existing tokens become invalid due to timestamp mismatch

### 4. Authentication Middleware

The middleware performs these checks:
1. Verifies JWT token signature and expiration
2. Fetches current user data from database
3. Compares `updated_at` from JWT with database value
4. Rejects token if timestamps don't match

## API Endpoints

### POST /api/auth/login
```json
{
  "mobile_no": "9876543210",
  "password": "userPassword"
}
```

**Response:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "application_id": "123"
}
```

### POST /api/auth/forgot-password
```json
{
  "mobile_no": "9876543210",
  "email": "user@example.com",
  "date_of_birth": "1990-01-01",
  "new_password": "newPassword123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Password reset successfully"
}
```

### GET /api/auth/profile (Protected)
**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "application_id": "123",
    "first_name": "John",
    "mobile_no": "9876543210",
    // ... other user data
  }
}
```

## Security Features

### 1. Session Invalidation
- Old tokens automatically become invalid when password changes
- No need to maintain a token blacklist
- Prevents unauthorized access with stolen tokens

### 2. Timestamp Precision
- Uses millisecond precision for timestamp comparison
- Ensures exact matching between JWT and database

### 3. Error Handling
- Clear error messages for different failure scenarios
- Proper HTTP status codes
- Detailed logging for debugging

## Environment Variables

```env
JWT_SECRET=your-secret-key-here
JWT_EXPIRES_IN=1d
DATABASE_URL=postgresql://user:pass@localhost:5432/db
```

## Testing

Run the test script to verify the authentication flow:

```bash
node test-auth-system.js
```

The test will:
1. Login and get a token
2. Access protected route successfully
3. Reset password
4. Verify old token is rejected
5. Login with new password
6. Access protected route with new token

## Error Scenarios

### Invalid Token After Password Reset
```json
{
  "success": false,
  "message": "Session expired due to password reset. Please login again."
}
```

### Missing Authorization Header
```json
{
  "success": false,
  "message": "Access token required"
}
```

### Invalid JWT Token
```json
{
  "success": false,
  "message": "Invalid or expired token"
}
```

## Best Practices

1. **Token Storage**: Store tokens securely on client side (httpOnly cookies recommended)
2. **HTTPS**: Always use HTTPS in production
3. **Token Expiration**: Set appropriate expiration times based on security requirements
4. **Error Handling**: Implement proper error handling on client side
5. **Logging**: Monitor authentication failures for security analysis

## Migration Notes

If migrating from the old system:
1. Existing tokens will remain valid until they expire naturally
2. Password resets will start invalidating old sessions immediately
3. No database migration required
4. Update client applications to handle new error messages

## Troubleshooting

### Common Issues

1. **Clock Skew**: Ensure server time is synchronized
2. **Database Precision**: PostgreSQL timestamp precision should match JavaScript Date precision
3. **Token Parsing**: Verify JWT secret matches between login and middleware
4. **CORS**: Configure CORS properly for cross-origin requests

### Debug Mode

Enable debug logging by setting:
```env
NODE_ENV=development
```

This will log detailed authentication information to help troubleshoot issues.