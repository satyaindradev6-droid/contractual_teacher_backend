# Active Schools API Guide

## Overview
This API fetches all schools whose application end_date is equal to or greater than today's date, along with their eligibility information.

## Endpoint
```
GET /api/invitation/active-schools
```

## Description
Returns all schools that have active or upcoming application periods based on their invitation configuration dates.

## Request
- **Method**: GET
- **URL**: `/api/invitation/active-schools`
- **Headers**: None required
- **Parameters**: None

## Response Structure

### Success Response (200)
```json
{
  "success": true,
  "data": [
    {
      "school_details": {
        "kv_id": "1001",
        "kv_name": "KENDRIYA VIDYALAYA SAC AHMEDABAD",
        "school_name": "KENDRIYA VIDYALAYA SAC AHMEDABAD",
        "ro_name": "AHMEDABAD",
        "state_name": "GUJARAT",
        "status": "1"
      },
      "eligibility": {
        "eligible": false,
        "reason": "Application deadline passed on Sun Mar 08 2026",
        "current_date": "2026-03-11T06:41:18.641Z",
        "application_period": {
          "start_date": "2026-03-07T00:00:00.000Z",
          "end_date": "2026-03-08T00:00:00.000Z",
          "days_remaining": 0
        }
      }
    }
  ]
}
```

### Error Response (500)
```json
{
  "success": false,
  "message": "Internal server error"
}
```

## Eligibility Logic

The API uses the same eligibility logic as `/api/invitation/check-eligibility/:kv_id`:

1. **Before Start Date**: 
   - `eligible = false`
   - `reason = "Application will start on {start_date}"`

2. **After End Date**: 
   - `eligible = false`
   - `reason = "Application deadline passed on {end_date}"`

3. **Within Application Period**: 
   - `eligible = true`
   - `reason = "Application open"`

## Response Fields

### school_details
- `kv_id`: School KV ID
- `kv_name`: KV name
- `school_name`: School name
- `ro_name`: Regional office name
- `state_name`: State name
- `status`: School status

### eligibility
- `eligible`: Boolean indicating if applications are currently open
- `reason`: Human-readable reason for eligibility status
- `current_date`: Current server timestamp in ISO format
- `application_period`: Object containing:
  - `start_date`: Application start date in ISO format
  - `end_date`: Application end date in ISO format
  - `days_remaining`: Number of days remaining (0 if not eligible)

## Filtering Logic

- Only schools with `end_date >= current_date` are included
- Date comparison is done at day level (ignoring time)
- Schools without proper date configuration are included with appropriate error messages

## Usage Examples

### cURL
```bash
curl -X GET "http://localhost:3000/api/invitation/active-schools"
```

### JavaScript (Axios)
```javascript
const response = await axios.get('/api/invitation/active-schools');
console.log(response.data);
```

### JavaScript (Fetch)
```javascript
const response = await fetch('/api/invitation/active-schools');
const data = await response.json();
console.log(data);
```

## Testing

Use the provided test file:
```bash
node test-active-schools-api.js
```

## Notes

- Returns empty array if no active schools found
- Schools without matching master_schools_kvs records will have null values in school_details
- Date calculations are timezone-aware based on server timezone
- API is read-only and doesn't require authentication