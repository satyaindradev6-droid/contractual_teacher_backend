# Invitation Eligibility API Guide

## Overview
This API checks if a school (KV) is eligible for applications based on the configured invitation dates in `config_app_invitation_date` table.

## Endpoint
```
GET /api/invitation/check-eligibility/:kv_id
```

## Parameters
- `kv_id` (required): The KV ID to check eligibility for

## Response Format

### Success Response (200)
```json
{
  "success": true,
  "data": {
    "invitation_config": {
      "id": 1,
      "ro_id": 123,
      "kv_id": 456,
      "start_date": "2024-01-01T00:00:00.000Z",
      "end_date": "2024-12-31T00:00:00.000Z",
      "created_at": "2024-01-01T00:00:00.000Z"
    },
    "school_details": {
      "kv_id": "456",
      "kv_name": "KV School Name",
      "school_name": "Full School Name",
      "ro_name": "Regional Office Name",
      "state_name": "State Name",
      "status": "Active"
    },
    "eligibility": {
      "eligible": true,
      "reason": "School is eligible for applications",
      "current_date": "2024-06-15T10:30:00.000Z",
      "application_period": {
        "start_date": "2024-01-01T00:00:00.000Z",
        "end_date": "2024-12-31T00:00:00.000Z",
        "days_remaining": 199
      }
    }
  }
}
```

### Error Responses

#### KV Not Found (404)
```json
{
  "success": false,
  "message": "No invitation configuration found for this KV ID",
  "data": {
    "kv_id": 456,
    "eligible": false,
    "reason": "KV not configured for applications"
  }
}
```

#### Invalid KV ID (400)
```json
{
  "success": false,
  "message": "Invalid kv_id parameter"
}
```

#### Server Error (500)
```json
{
  "success": false,
  "message": "Internal server error"
}
```

## Eligibility Logic

The API determines eligibility based on the following conditions:

1. **KV Configuration Exists**: The KV must have an entry in `config_app_invitation_date`
2. **Dates Configured**: Both `start_date` and `end_date` must be set
3. **Current Date Check**: Current date must be between start_date and end_date (inclusive of both dates)

**Important**: The comparison is done on date-only basis (ignoring time), so applications are allowed throughout the entire end_date (until 11:59:59 PM).

### Possible Eligibility Statuses

| Status | Reason | Description |
|--------|--------|-------------|
| ❌ Not Eligible | "KV not configured for applications" | No config found for this KV |
| ❌ Not Eligible | "Application dates not configured" | start_date or end_date is null |
| ❌ Not Eligible | "Applications will open on [date]" | Current date is before start_date |
| ❌ Not Eligible | "Application deadline passed on [date]" | Current date is after end_date |
| ✅ Eligible | "School is eligible for applications" | Current date is within the application period |

## Usage Examples

### cURL
```bash
curl -X GET "http://localhost:8000/api/invitation/check-eligibility/456"
```

### JavaScript/Fetch
```javascript
const response = await fetch('/api/invitation/check-eligibility/456');
const data = await response.json();

if (data.success && data.data.eligibility.eligible) {
  console.log('School is eligible!');
  console.log(`Days remaining: ${data.data.eligibility.application_period.days_remaining}`);
} else {
  console.log(`Not eligible: ${data.data.eligibility.reason}`);
}
```

### Node.js Test
Run the provided test file:
```bash
node test-invitation-api.js
```

## Database Tables Used

1. **config_app_invitation_date**: Main configuration table
   - `kv_id`: Unique identifier for the KV
   - `start_date`: Application start date
   - `end_date`: Application end date
   - `ro_id`: Regional office ID

2. **master_schools_kvs**: School details (optional, for additional info)
   - `kv_id`: Links to config table
   - `school_name`, `kv_name`: Display names
   - `status`: School status

## Integration Notes

- This API can be called before allowing users to access application forms
- The `days_remaining` field helps show countdown timers
- School details provide context for display purposes
- The API is read-only and doesn't modify any data