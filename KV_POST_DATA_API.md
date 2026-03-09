# KV Post Data API - Dynamic Designation & Subject Loading

## Endpoint
```
GET /api/kv-post-data/:kv_id
```

## Description
Fetches available designations and subjects for a specific KV (school) where positions are open (`is_open = 1`).

## Parameters
- `kv_id` (path parameter, required): The KV ID of the selected school

## Response Format
```json
{
  "success": true,
  "data": {
    "designations": [
      { "id": 1, "name": "PRT" },
      { "id": 2, "name": "TGT" }
    ],
    "subjects": [
      { "id": 3, "name": "Mathematics" },
      { "id": 4, "name": "English" }
    ]
  }
}
```

## Frontend Integration Example

### 1. Fetch KV Post Data when School is Selected
```javascript
const handleSchoolSelect = async (selectedSchool) => {
  const kvId = selectedSchool.kv_id;
  
  try {
    const response = await fetch(`/api/kv-post-data/${kvId}`);
    const result = await response.json();
    
    if (result.success) {
      setDesignations(result.data.designations);
      setSubjects(result.data.subjects);
    }
  } catch (error) {
    console.error('Error fetching KV post data:', error);
  }
};
```

### 2. Populate Designation Dropdown
```jsx
<Select 
  disabled={!designations.length}
  onValueChange={(value) => setSelectedDesignation(value)}
>
  <SelectTrigger>
    <SelectValue placeholder="Select Designation" />
  </SelectTrigger>
  <SelectContent>
    {designations.map(d => (
      <SelectItem key={d.id} value={d.id.toString()}>
        {d.name}
      </SelectItem>
    ))}
  </SelectContent>
</Select>
```

### 3. Populate Subject Dropdown
```jsx
<Select 
  disabled={!subjects.length}
  onValueChange={(value) => setSelectedSubject(value)}
>
  <SelectTrigger>
    <SelectValue placeholder="Select Subject" />
  </SelectTrigger>
  <SelectContent>
    {subjects.map(s => (
      <SelectItem key={s.id} value={s.id.toString()}>
        {s.name}
      </SelectItem>
    ))}
  </SelectContent>
</Select>
```

## Complete Flow

1. **User selects State** → Fetch schools for that state
2. **User selects School** → Extract `kv_id` from selected school
3. **Call API** → `GET /api/kv-post-data/:kv_id`
4. **Populate Dropdowns** → Use returned designations and subjects
5. **User selects Designation & Subject** → Submit school preference

## Key Features
- Only returns positions where `is_open = 1`
- Automatically removes duplicates
- Returns empty arrays if no open positions
- Designations and subjects are fetched from master tables
- Dropdowns should be disabled until school is selected

## Error Handling
```javascript
if (!result.success) {
  // Handle error
  console.error('Failed to fetch KV post data');
  setDesignations([]);
  setSubjects([]);
}
```

## Notes
- The endpoint returns both designations and subjects in a single call for efficiency
- Empty arrays are returned if no open positions exist for the selected KV
- The API validates the `kv_id` parameter and returns 400 for invalid inputs
