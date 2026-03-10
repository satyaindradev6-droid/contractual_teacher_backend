# Submit Application Debug Guide

## Issues Identified and Fixed

### 1. Missing Database Constraints
**Problem**: The `submit_application` table lacked:
- Foreign key relationship to `applications` table
- Unique constraint on `application_id` (allowing duplicate submissions)

**Solution**: Updated Prisma schema to add:
```prisma
model submit_application {
  application_id BigInt       @unique
  applications   applications @relation(fields: [application_id], references: [application_id])
}
```

### 2. BigInt Handling Issues
**Problem**: Inconsistent BigInt conversions could cause type mismatches.

**Solution**: 
- Store `appIdBigInt` once and reuse it
- Ensure consistent type handling throughout

### 3. Missing Error Details
**Problem**: Generic error messages made debugging difficult.

**Solution**: Added detailed console logging and error messages in catch block.

### 4. Type Safety
**Problem**: `result` variable had implicit `any` type.

**Solution**: Let TypeScript infer the type from Prisma operations.

## Steps to Fix Your Database

### Step 1: Apply Database Migration
Run the SQL migration to add constraints:

```bash
# Connect to your PostgreSQL database
psql -U your_username -d your_database_name -f migration_add_submit_application_constraints.sql
```

Or manually run:
```sql
ALTER TABLE submit_application 
ADD CONSTRAINT submit_application_application_id_key UNIQUE (application_id);

ALTER TABLE submit_application 
ADD CONSTRAINT submit_application_application_id_fkey 
FOREIGN KEY (application_id) 
REFERENCES applications(application_id) 
ON DELETE NO ACTION 
ON UPDATE NO ACTION;
```

### Step 2: Regenerate Prisma Client
After updating the schema, regenerate the Prisma client:

```bash
npx prisma generate
```

### Step 3: Test the Endpoint
Use the test script:

```bash
node test-submit-application.js
```

## Common Issues and Solutions

### Issue 1: "Record not inserted but no error"
**Causes**:
- Database transaction rolled back silently
- Foreign key constraint violation
- Unique constraint violation

**Debug**:
```bash
# Check PostgreSQL logs
tail -f /var/log/postgresql/postgresql-*.log

# Or check application logs for detailed error
```

### Issue 2: BigInt Serialization Error
**Symptom**: `TypeError: Do not know how to serialize a BigInt`

**Solution**: Already handled in the response by converting to string:
```typescript
id: result.id.toString(),
application_id: result.application_id.toString()
```

### Issue 3: Foreign Key Violation
**Symptom**: `Foreign key constraint violation`

**Solution**: Ensure the `application_id` exists in `applications` table before inserting.

## Testing Checklist

- [ ] Database constraints applied
- [ ] Prisma client regenerated
- [ ] Server restarted
- [ ] Test with valid application_id
- [ ] Test with duplicate submission (should update)
- [ ] Test with invalid application_id (should return 404)
- [ ] Check database directly: `SELECT * FROM submit_application;`

## Verification Queries

```sql
-- Check if record was inserted
SELECT * FROM submit_application WHERE application_id = 1;

-- Check constraints
SELECT 
    conname AS constraint_name,
    contype AS constraint_type,
    pg_get_constraintdef(oid) AS definition
FROM pg_constraint
WHERE conrelid = 'submit_application'::regclass;

-- Check foreign key relationship
SELECT 
    tc.constraint_name,
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
WHERE tc.table_name = 'submit_application' 
    AND tc.constraint_type = 'FOREIGN KEY';
```

## API Request Examples

### Create Submission
```bash
curl -X POST http://localhost:8000/api/submit-application \
  -H "Content-Type: application/json" \
  -d '{
    "application_id": 1,
    "is_submitted": 1
  }'
```

### Update Submission
```bash
curl -X POST http://localhost:8000/api/submit-application \
  -H "Content-Type: application/json" \
  -d '{
    "application_id": 1,
    "is_submitted": 0
  }'
```

### Get Submission
```bash
curl http://localhost:8000/api/submit-application/1
```

## Expected Behavior

1. **First submission**: Creates new record with `submission_id = 26000000 + application_id`
2. **Subsequent submissions**: Updates existing record
3. **Invalid application_id**: Returns 404 error
4. **Missing application_id**: Returns 400 error

## Next Steps

1. Apply the database migration
2. Regenerate Prisma client: `npx prisma generate`
3. Rebuild TypeScript: `npm run build`
4. Restart your server
5. Run the test script
6. Check server logs for detailed error messages
