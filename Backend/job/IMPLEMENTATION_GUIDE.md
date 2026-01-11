# Job Post Service - Implementation Documentation

## Overview
This document describes the implementation of employment type validation and structured salary format for the Job Post service, fulfilling requirements 4.1.1 (Simplex).

## Changes Made

### 1. Employment Type Validation ✅

#### **Previous Implementation:**
- Single `String employmentType` field
- No validation

#### **New Implementation:**
- Changed to `List<String> employmentTypes`
- Added validation rules:
  - ✅ **Can have multiple types**: e.g., ["Internship", "Contract"]
  - ❌ **Cannot have both Full-time AND Part-time** simultaneously
  - ✅ Validates all employment types are from allowed list: "Full-time", "Part-time", "Internship", "Contract"

#### **Files Modified:**
- `JobPost.java` - Added `employmentTypes` field and `validateEmploymentTypes()` method
- `EmploymentType.java` - New enum for type safety
- `InvalidEmploymentTypeException.java` - New exception for validation errors

#### **Example Requests:**

**Valid Request 1** (Multiple types):
```json
{
  "employmentTypes": ["Internship", "Contract"],
  ...
}
```

**Valid Request 2** (Single type):
```json
{
  "employmentTypes": ["Full-time"],
  ...
}
```

**Invalid Request** (Both Full-time and Part-time):
```json
{
  "employmentTypes": ["Full-time", "Part-time"],
  ...
}
```
**Error Response:**
```json
{
  "timestamp": "2026-01-10T...",
  "status": 400,
  "error": "Invalid Employment Type",
  "message": "Job post cannot be both Full-time and Part-time simultaneously"
}
```

---

### 2. Structured Salary Format ✅

#### **Previous Implementation:**
- Free-form `String salary` field
- No validation or structure

#### **New Implementation:**
Structured salary with type-based validation:

| Salary Type | Required Fields | Example Display |
|-------------|----------------|-----------------|
| **RANGE** | `salaryMin`, `salaryMax` | "1000-1500 USD" |
| **ABOUT** | `salaryMin` | "About 1000 USD" |
| **UP_TO** | `salaryMax` | "Up to 2000 USD" |
| **FROM** | `salaryMin` | "From 3000 USD" |
| **NEGOTIABLE** | None | "Negotiable" |

#### **Validation Rules:**
- ✅ `salaryType` is required
- ✅ `salaryCurrency` is required (e.g., "USD", "VND")
- ✅ For RANGE: both min and max required, min must be ≤ max
- ✅ For FROM/ABOUT: min required and must be > 0
- ✅ For UP_TO: max required and must be > 0
- ✅ For NEGOTIABLE: no salary values required

#### **Files Created:**
- `SalaryType.java` - Enum for salary types
- `InvalidSalaryException.java` - Exception for salary validation errors
- `JobPost.java` - Added salary fields and `validateSalary()` method

#### **Example Requests:**

**RANGE Salary:**
```json
{
  "salaryType": "RANGE",
  "salaryMin": 1000,
  "salaryMax": 1500,
  "salaryCurrency": "USD",
  ...
}
```

**ABOUT Salary:**
```json
{
  "salaryType": "ABOUT",
  "salaryMin": 1000,
  "salaryCurrency": "USD",
  ...
}
```

**NEGOTIABLE Salary:**
```json
{
  "salaryType": "NEGOTIABLE",
  "salaryCurrency": "USD",
  ...
}
```

**Invalid Request** (RANGE without max):
```json
{
  "salaryType": "RANGE",
  "salaryMin": 1000,
  "salaryCurrency": "USD",
  ...
}
```
**Error Response:**
```json
{
  "timestamp": "2026-01-10T...",
  "status": 400,
  "error": "Invalid Salary Configuration",
  "message": "RANGE salary type requires both minimum and maximum values"
}
```

---

### 3. Additional Improvements

#### **Global Exception Handling**
- `GlobalExceptionHandler.java` - Centralized error handling with proper HTTP status codes and error messages

#### **DTOs for Type Safety**
- `CreateJobPostRequest.java` - Request DTO with validation annotations
- `JobPostResponse.java` - Response DTO with formatted salary display
- `JobPostMapper.java` - Utility for converting between entities and DTOs

#### **Service Layer Updates**
- Added validation calls in `JobService.createJobPost()`
- Added validation calls in `JobService.updateJobPost()`
- Updated query for employment type filtering (uses `in` operator for list field)

---

## Migration Guide

### Database Migration
The existing data needs to be migrated:

**Old Schema:**
```json
{
  "employmentType": "Full-time",
  "salary": "1000-1500 USD"
}
```

**New Schema:**
```json
{
  "employmentTypes": ["Full-time"],
  "salaryType": "RANGE",
  "salaryMin": 1000,
  "salaryMax": 1500,
  "salaryCurrency": "USD"
}
```

### Migration Script (MongoDB)
```javascript
db.getCollection('job-posts').find().forEach(function(doc) {
  // Migrate employmentType to employmentTypes
  if (doc.employmentType) {
    db.getCollection('job-posts').updateOne(
      { _id: doc._id },
      { 
        $set: { employmentTypes: [doc.employmentType] },
        $unset: { employmentType: "" }
      }
    );
  }
  
  // Parse and migrate salary
  if (doc.salary) {
    let update = { salaryCurrency: "USD" }; // Default currency
    
    if (doc.salary.toLowerCase().includes("negotiable")) {
      update.salaryType = "NEGOTIABLE";
    } else if (doc.salary.match(/(\d+)-(\d+)/)) {
      const match = doc.salary.match(/(\d+)-(\d+)/);
      update.salaryType = "RANGE";
      update.salaryMin = NumberDecimal(match[1]);
      update.salaryMax = NumberDecimal(match[2]);
    } else if (doc.salary.toLowerCase().includes("about")) {
      const match = doc.salary.match(/(\d+)/);
      update.salaryType = "ABOUT";
      update.salaryMin = NumberDecimal(match[1]);
    } else if (doc.salary.toLowerCase().includes("up to")) {
      const match = doc.salary.match(/(\d+)/);
      update.salaryType = "UP_TO";
      update.salaryMax = NumberDecimal(match[1]);
    } else if (doc.salary.toLowerCase().includes("from")) {
      const match = doc.salary.match(/(\d+)/);
      update.salaryType = "FROM";
      update.salaryMin = NumberDecimal(match[1]);
    }
    
    // Extract currency if present
    if (doc.salary.includes("VND")) {
      update.salaryCurrency = "VND";
    }
    
    db.getCollection('job-posts').updateOne(
      { _id: doc._id },
      { 
        $set: update,
        $unset: { salary: "" }
      }
    );
  }
});
```

---

## Testing

### Unit Tests Needed

1. **Employment Type Validation Tests:**
   - ✅ Valid: Single Full-time
   - ✅ Valid: Multiple types (Internship + Contract)
   - ❌ Invalid: Full-time + Part-time
   - ❌ Invalid: Empty list
   - ❌ Invalid: Unknown type

2. **Salary Validation Tests:**
   - ✅ RANGE: Valid with min < max
   - ❌ RANGE: Invalid without min or max
   - ❌ RANGE: Invalid with min > max
   - ✅ ABOUT: Valid with min value
   - ✅ UP_TO: Valid with max value
   - ✅ FROM: Valid with min value
   - ✅ NEGOTIABLE: Valid without values
   - ❌ All types: Invalid with negative values

### Integration Tests Needed

1. **Create Job Post:**
   - Test with various valid employment type combinations
   - Test with various salary types
   - Verify validation errors return proper HTTP 400

2. **Update Job Post:**
   - Test updating employment types
   - Test updating salary structure
   - Verify validation on updates

3. **Search Job Posts:**
   - Verify filtering by employment type works with new list field
   - Test multiple employment type filters

---

## API Changes

### Breaking Changes ⚠️

**Request/Response Changes:**

| Old Field | New Fields | Migration |
|-----------|-----------|-----------|
| `employmentType: String` | `employmentTypes: List<String>` | Wrap in array |
| `salary: String` | `salaryType`, `salaryMin`, `salaryMax`, `salaryCurrency` | Parse structure |

**Client Updates Required:**
- Update all job post creation/update requests to use new structure
- Update display logic to handle `employmentTypes` array
- Update salary display logic (or use `salaryDisplay` from response)

---

## Complete Example

### Create Job Post Request
```json
POST /jobs
{
  "title": "Senior Backend Engineer",
  "department": "Engineering",
  "description": "We are looking for an experienced backend engineer...",
  "employmentTypes": ["Full-time"],
  "salaryType": "RANGE",
  "salaryMin": 1000,
  "salaryMax": 1500,
  "salaryCurrency": "USD",
  "location": "Ho Chi Minh City, Vietnam",
  "published": true,
  "skills": ["Java", "Spring Boot", "MongoDB", "Kafka"]
}
```

### Response
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "companyId": "company-uuid",
  "title": "Senior Backend Engineer",
  "department": "Engineering",
  "description": "We are looking for an experienced backend engineer...",
  "employmentTypes": ["Full-time"],
  "postedDate": "2026-01-10",
  "expiryDate": null,
  "salaryType": "RANGE",
  "salaryMin": 1000,
  "salaryMax": 1500,
  "salaryCurrency": "USD",
  "salaryDisplay": "1000-1500 USD",
  "location": "Ho Chi Minh City, Vietnam",
  "published": true,
  "skills": ["Java", "Spring Boot", "MongoDB", "Kafka"]
}
```

---

## Requirements Status

| Requirement | Status | Implementation |
|-------------|--------|----------------|
| 4.1.1 - Multiple employment types | ✅ Complete | `employmentTypes: List<String>` |
| 4.1.1 - Cannot be Full-time + Part-time | ✅ Complete | `validateEmploymentTypes()` |
| 4.1.1 - Salary Range format | ✅ Complete | `SalaryType.RANGE` |
| 4.1.1 - Salary Estimation formats | ✅ Complete | `SalaryType.ABOUT/UP_TO/FROM` |
| 4.1.1 - Salary Negotiable | ✅ Complete | `SalaryType.NEGOTIABLE` |
| 4.1.1 - Public/Private posts | ✅ Complete | `published` field |

---

## Files Created/Modified

### New Files:
- `enums/SalaryType.java`
- `enums/EmploymentType.java`
- `exception/InvalidEmploymentTypeException.java`
- `exception/InvalidSalaryException.java`
- `exception/GlobalExceptionHandler.java`
- `dto/CreateJobPostRequest.java`
- `dto/JobPostResponse.java`
- `util/JobPostMapper.java`

### Modified Files:
- `entity/JobPost.java`
- `service/JobService.java`

---

## Next Steps

1. **Run Migration Script** on existing data
2. **Update Frontend** to use new API structure
3. **Add Unit Tests** for validation logic
4. **Add Integration Tests** for API endpoints
5. **Update API Documentation** (Swagger/OpenAPI)
6. **Deploy and Monitor** for any issues
