# Company Service Testing Guide

## 📋 Prerequisites

Before testing, ensure the following services are running:

1. **MongoDB** (Port 27018)
2. **Kafka + Zookeeper** (Port 29092)
3. **Kong API Gateway** (Port 8000, 8001)
4. **Eureka Discovery Server** (Port 8761)
5. **Authentication Service** (Port 8081)
6. **Company Service** (Port 8082)

---

## 🚀 Step 1: Start Infrastructure

```bash
# From Backend directory
cd Backend
docker-compose up -d

# Verify services are running
docker ps
```

**Expected output:**
- MongoDB running on port 27018
- Kafka running on port 29092
- Kong Gateway on port 8000 (proxy), 8001 (admin)
- Zookeeper on port 2181

---

## 🏗️ Step 2: Start Discovery Server

```bash
cd Backend/discovery
./gradlew bootRun
```

**Verify:** Open http://localhost:8761 - should see Eureka dashboard

---

## 🔐 Step 3: Start Authentication Service

```bash
cd Backend/authentication
./gradlew bootRun
```

**Verify:** Service should register with Eureka (check port 8761)

---

## 🏢 Step 4: Start Company Service

```bash
cd Backend/company
./gradlew bootRun
```

**Expected logs:**
```
Started CompanyApplication in X seconds
Registering application COMPANY-SERVICE with eureka
Tomcat started on port(s): 8082 (http)
```

---

## 🧪 Testing with Postman

### Test Flow:

1. **Register a company** (via Authentication Service)
2. **Login** to get JWT token
3. **Check profile status**
4. **Create public profile**
5. **Update public profile**

---

## 📝 Test 1: Register Company

**Endpoint:** `POST http://localhost:8000/authentication/register`  
*(Through Kong Gateway)*

**Request Body:**
```json
{
  "companyName": "Tech Innovations Inc",
  "email": "contact@techinnovations.com",
  "password": "SecurePass123!",
  "phoneNumber": "+1-555-0123",
  "address": "123 Silicon Valley",
  "city": "San Francisco",
  "country": "USA"
}
```

**Expected Response:** `200 OK`

**What happens:**
1. Authentication service creates user account
2. Publishes event to Kafka topic `company-registration`
3. Company service consumes event and creates Company entity (NO PublicProfile yet)

**Verify in MongoDB:**
```javascript
// Connect to MongoDB
mongosh --port 27018 -u admin -p admin

use mongodb-company

// Check if company was created
db.companies.find().pretty()
```

**Expected result:**
```json
{
  "_id": "some-uuid",
  "companyId": "some-uuid",
  "companyName": "Tech Innovations Inc",
  "email": "contact@techinnovations.com",
  "phoneNumber": "+1-555-0123",
  "streetAddress": "123 Silicon Valley",
  "city": "San Francisco",
  "country": "USA",
  "shardKey": "USA",
  "isEmailVerified": false,
  "isActive": true,
  "isPremium": false,
  "ssoProvider": "LOCAL"
}
```

---

## 🔑 Test 2: Login to Get JWT Token

**Endpoint:** `POST http://localhost:8000/authentication/login`

**Request Body:**
```json
{
  "email": "contact@techinnovations.com",
  "password": "SecurePass123!"
}
```

**Expected Response:**
```json
"eyJhbGciOiJSUzI1NiJ9.eyJzdWIiOiJjb250YWN0QHRlY2hpbm5vdmF0aW9ucy5jb20iLCJpZCI6InNvbWUtdXVpZCIsImVtYWlsIjoiY29udGFjdEB0ZWNoaW5ub3ZhdGlvbnMuY29tIiwicm9sZXMiOlsiQ09NUEFOWSJdLCJpYXQiOjE3MDM4OTc2MDAsImV4cCI6MTcwMzg5ODUwMH0...."
```

**Save this token!** You'll need it for all subsequent requests.

---

## 📊 Test 3: Check Profile Status

**Endpoint:** `GET http://localhost:8000/company/profile/status`

**Headers:**
```
Authorization: Bearer YOUR_JWT_TOKEN_HERE
```

**Expected Response:**
```json
{
  "companyId": "some-uuid",
  "hasPublicProfile": false
}
```

**Explanation:** PublicProfile doesn't exist yet - this triggers the modal on frontend!

---

## 🎨 Test 4: Create Public Profile (First-time onboarding)

**Endpoint:** `POST http://localhost:8000/company/public-profile`

**Headers:**
```
Authorization: Bearer YOUR_JWT_TOKEN_HERE
Content-Type: application/json
```

**Request Body:**
```json
{
  "companyName": "Tech Innovations Inc",
  "logoUrl": "https://storage.example.com/logos/tech-innovations.png",
  "bannerUrl": "https://storage.example.com/banners/tech-innovations-banner.jpg"
}
```

**Expected Response:** `201 Created`
```json
{
  "companyId": "some-uuid",
  "displayName": "Tech Innovations Inc",
  "aboutUs": "",
  "whoWeAreLookingFor": "",
  "websiteUrl": null,
  "industryDomain": null,
  "logoUrl": "https://storage.example.com/logos/tech-innovations.png",
  "bannerUrl": "https://storage.example.com/banners/tech-innovations-banner.jpg",
  "country": "USA",
  "city": "San Francisco",
  "createdAt": "2025-12-18T10:30:00",
  "updatedAt": "2025-12-18T10:30:00"
}
```

**Verify in MongoDB:**
```javascript
use mongodb-company
db.public_profiles.find().pretty()
```

---

## 📝 Test 5: Get Public Profile

**Endpoint:** `GET http://localhost:8000/company/public-profile`

**Headers:**
```
Authorization: Bearer YOUR_JWT_TOKEN_HERE
```

**Expected Response:** `200 OK` (same structure as create response)

---

## ✏️ Test 6: Update Public Profile (Settings page)

**Endpoint:** `PUT http://localhost:8000/company/public-profile`

**Headers:**
```
Authorization: Bearer YOUR_JWT_TOKEN_HERE
Content-Type: application/json
```

**Request Body:**
```json
{
  "displayName": "Tech Innovations Inc.",
  "aboutUs": "We are a leading software development company specializing in AI and Machine Learning solutions. Founded in 2020, we help businesses transform through technology.",
  "whoWeAreLookingFor": "We're looking for passionate developers who love solving complex problems and want to work on cutting-edge AI projects.",
  "websiteUrl": "https://techinnovations.com",
  "industryDomain": "Software Development"
}
```

**Expected Response:** `200 OK` with updated profile

---

## 🔍 Test 7: Get Company Profile

**Endpoint:** `GET http://localhost:8000/company/profile`

**Headers:**
```
Authorization: Bearer YOUR_JWT_TOKEN_HERE
```

**Expected Response:**
```json
{
  "companyId": "some-uuid",
  "companyName": "Tech Innovations Inc",
  "email": "contact@techinnovations.com",
  "phoneNumber": "+1-555-0123",
  "streetAddress": "123 Silicon Valley",
  "city": "San Francisco",
  "country": "USA",
  "isEmailVerified": false,
  "isActive": true,
  "isPremium": false,
  "ssoProvider": "LOCAL",
  "hasPublicProfile": true,  // Now true!
  "createdAt": "2025-12-18T10:00:00",
  "updatedAt": "2025-12-18T10:00:00"
}
```

---

## ❌ Error Testing

### Test Invalid Token

**Endpoint:** `GET http://localhost:8000/company/profile/status`

**Headers:**
```
Authorization: Bearer invalid-token
```

**Expected Response:** `401 Unauthorized` (Kong should reject)

---

### Test Create Profile Twice

**Endpoint:** `POST http://localhost:8000/company/public-profile`

Try to create profile again with same account.

**Expected Response:** `400 Bad Request`
```json
{
  "message": "Public profile already exists for this company"
}
```

---

## 🗄️ MongoDB Verification Commands

```javascript
// Connect to MongoDB
mongosh --port 27018 -u admin -p admin

// Switch to company database
use mongodb-company

// List all collections
show collections

// Count companies
db.companies.countDocuments()

// Count public profiles
db.public_profiles.countDocuments()

// Find company by email
db.companies.find({ "email": "contact@techinnovations.com" }).pretty()

// Find public profile by companyId
db.public_profiles.find({ "companyId": "some-uuid" }).pretty()

// Check indexes
db.companies.getIndexes()
db.public_profiles.getIndexes()

// Delete test data (cleanup)
db.companies.deleteMany({})
db.public_profiles.deleteMany({})
```

---

## 🔧 Troubleshooting

### Service not starting?

**Check logs:**
```bash
cd Backend/company
./gradlew bootRun --info
```

**Common issues:**
- ❌ MongoDB not running → `docker ps` should show MongoDB container
- ❌ Port 8082 already in use → Change port in application.yml
- ❌ Eureka not reachable → Start discovery service first

### Can't connect to MongoDB?

```bash
# Test connection
mongosh --port 27018 -u admin -p admin

# If fails, check docker
docker ps | grep mongo
docker logs <mongo-container-id>
```

### Kong not routing requests?

**Check Kong configuration:**
```bash
# List routes
curl -X GET http://localhost:8001/routes

# List services
curl -X GET http://localhost:8001/services
```

**You may need to configure Kong route for company service:**
```bash
# Create service
curl -X POST http://localhost:8001/services \
  --data name=company-service \
  --data url=http://localhost:8082

# Create route
curl -X POST http://localhost:8001/services/company-service/routes \
  --data paths[]=/company \
  --data strip_path=true
```

### JWT token expired?

Login again to get a fresh token. Tokens typically expire after 15 minutes.

---

## ✅ Success Checklist

- [ ] All infrastructure services running (Docker)
- [ ] Discovery server shows registered services
- [ ] Can register a new company
- [ ] Can login and receive JWT token
- [ ] Profile status returns `hasPublicProfile: false`
- [ ] Can create public profile successfully
- [ ] Profile status now returns `hasPublicProfile: true`
- [ ] Can retrieve public profile
- [ ] Can update public profile
- [ ] MongoDB shows correct data in both collections

---

## 📊 Postman Collection

Import this collection for easier testing:

**Collection JSON:** Create a file `CompanyService.postman_collection.json`

```json
{
  "info": {
    "name": "Company Service Tests",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "variable": [
    {
      "key": "base_url",
      "value": "http://localhost:8000"
    },
    {
      "key": "token",
      "value": ""
    }
  ],
  "item": [
    {
      "name": "1. Register Company",
      "request": {
        "method": "POST",
        "header": [],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"companyName\": \"Tech Innovations Inc\",\n  \"email\": \"contact@techinnovations.com\",\n  \"password\": \"SecurePass123!\",\n  \"phoneNumber\": \"+1-555-0123\",\n  \"address\": \"123 Silicon Valley\",\n  \"city\": \"San Francisco\",\n  \"country\": \"USA\"\n}",
          "options": {
            "raw": {
              "language": "json"
            }
          }
        },
        "url": {
          "raw": "{{base_url}}/authentication/register",
          "host": ["{{base_url}}"],
          "path": ["authentication", "register"]
        }
      }
    },
    {
      "name": "2. Login",
      "event": [
        {
          "listen": "test",
          "script": {
            "exec": [
              "pm.collectionVariables.set('token', pm.response.text().replace(/\"/g, ''));"
            ]
          }
        }
      ],
      "request": {
        "method": "POST",
        "header": [],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"email\": \"contact@techinnovations.com\",\n  \"password\": \"SecurePass123!\"\n}",
          "options": {
            "raw": {
              "language": "json"
            }
          }
        },
        "url": {
          "raw": "{{base_url}}/authentication/login",
          "host": ["{{base_url}}"],
          "path": ["authentication", "login"]
        }
      }
    },
    {
      "name": "3. Check Profile Status",
      "request": {
        "method": "GET",
        "header": [
          {
            "key": "Authorization",
            "value": "Bearer {{token}}"
          }
        ],
        "url": {
          "raw": "{{base_url}}/company/profile/status",
          "host": ["{{base_url}}"],
          "path": ["company", "profile", "status"]
        }
      }
    },
    {
      "name": "4. Create Public Profile",
      "request": {
        "method": "POST",
        "header": [
          {
            "key": "Authorization",
            "value": "Bearer {{token}}"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"companyName\": \"Tech Innovations Inc\",\n  \"logoUrl\": \"https://storage.example.com/logos/tech.png\",\n  \"bannerUrl\": \"https://storage.example.com/banners/tech.jpg\"\n}",
          "options": {
            "raw": {
              "language": "json"
            }
          }
        },
        "url": {
          "raw": "{{base_url}}/company/public-profile",
          "host": ["{{base_url}}"],
          "path": ["company", "public-profile"]
        }
      }
    },
    {
      "name": "5. Get Public Profile",
      "request": {
        "method": "GET",
        "header": [
          {
            "key": "Authorization",
            "value": "Bearer {{token}}"
          }
        ],
        "url": {
          "raw": "{{base_url}}/company/public-profile",
          "host": ["{{base_url}}"],
          "path": ["company", "public-profile"]
        }
      }
    },
    {
      "name": "6. Update Public Profile",
      "request": {
        "method": "PUT",
        "header": [
          {
            "key": "Authorization",
            "value": "Bearer {{token}}"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"aboutUs\": \"We are a leading software company...\",\n  \"whoWeAreLookingFor\": \"Passionate developers...\",\n  \"websiteUrl\": \"https://techinnovations.com\",\n  \"industryDomain\": \"Software Development\"\n}",
          "options": {
            "raw": {
              "language": "json"
            }
          }
        },
        "url": {
          "raw": "{{base_url}}/company/public-profile",
          "host": ["{{base_url}}"],
          "path": ["company", "public-profile"]
        }
      }
    },
    {
      "name": "7. Add Company Media",
      "request": {
        "method": "POST",
        "header": [
          {
            "key": "Authorization",
            "value": "Bearer {{token}}"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"url\": \"https://storage.example.com/media/office-tour.jpg\",\n  \"mediaType\": \"IMAGE\",\n  \"title\": \"Office Tour\",\n  \"description\": \"A tour of our modern workspace\",\n  \"orderIndex\": 1\n}",
          "options": {
            "raw": {
              "language": "json"
            }
          }
        },
        "url": {
          "raw": "{{base_url}}/company/media",
          "host": ["{{base_url}}"],
          "path": ["company", "media"]
        }
      }
    },
    {
      "name": "8. Get All Company Media",
      "request": {
        "method": "GET",
        "header": [
          {
            "key": "Authorization",
            "value": "Bearer {{token}}"
          }
        ],
        "url": {
          "raw": "{{base_url}}/company/media",
          "host": ["{{base_url}}"],
          "path": ["company", "media"]
        }
      }
    },
    {
      "name": "9. Get Active Media",
      "request": {
        "method": "GET",
        "header": [
          {
            "key": "Authorization",
            "value": "Bearer {{token}}"
          }
        ],
        "url": {
          "raw": "{{base_url}}/company/media/active",
          "host": ["{{base_url}}"],
          "path": ["company", "media", "active"]
        }
      }
    },
    {
      "name": "10. Get Media by Type",
      "request": {
        "method": "GET",
        "header": [
          {
            "key": "Authorization",
            "value": "Bearer {{token}}"
          }
        ],
        "url": {
          "raw": "{{base_url}}/company/media/type/IMAGE",
          "host": ["{{base_url}}"],
          "path": ["company", "media", "type", "IMAGE"]
        }
      }
    },
    {
      "name": "11. Update Media",
      "request": {
        "method": "PUT",
        "header": [
          {
            "key": "Authorization",
            "value": "Bearer {{token}}"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"title\": \"Updated Office Tour\",\n  \"description\": \"Our newly renovated workspace\",\n  \"isActive\": true,\n  \"orderIndex\": 2\n}",
          "options": {
            "raw": {
              "language": "json"
            }
          }
        },
        "url": {
          "raw": "{{base_url}}/company/media/{{mediaId}}",
          "host": ["{{base_url}}"],
          "path": ["company", "media", "{{mediaId}}"]
        }
      }
    },
    {
      "name": "12. Reorder Media",
      "request": {
        "method": "PUT",
        "header": [
          {
            "key": "Authorization",
            "value": "Bearer {{token}}"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "[\n  \"mediaId1\",\n  \"mediaId2\",\n  \"mediaId3\"\n]",
          "options": {
            "raw": {
              "language": "json"
            }
          }
        },
        "url": {
          "raw": "{{base_url}}/company/media/reorder",
          "host": ["{{base_url}}"],
          "path": ["company", "media", "reorder"]
        }
      }
    },
    {
      "name": "13. Get Media Count",
      "request": {
        "method": "GET",
        "header": [
          {
            "key": "Authorization",
            "value": "Bearer {{token}}"
          }
        ],
        "url": {
          "raw": "{{base_url}}/company/media/count",
          "host": ["{{base_url}}"],
          "path": ["company", "media", "count"]
        }
      }
    },
    {
      "name": "14. Delete Media",
      "request": {
        "method": "DELETE",
        "header": [
          {
            "key": "Authorization",
            "value": "Bearer {{token}}"
          }
        ],
        "url": {
          "raw": "{{base_url}}/company/media/{{mediaId}}",
          "host": ["{{base_url}}"],
          "path": ["company", "media", "{{mediaId}}"]
        }
      }
    }
  ]
}
```

---

## 🖼️ Media Management Features

The Company Service now includes comprehensive media gallery management:

### Media Types
- `IMAGE` - Company photos, office images, team pictures
- `VIDEO` - Company videos, promotional content

### Media Limits
- Maximum 10 media items per company
- Automatic ordering with `orderIndex`
- Active/inactive status control

### Available Operations

1. **Add Media** - Upload new images or videos to gallery
2. **Get All Media** - Retrieve all media (ordered by `orderIndex`)
3. **Get Active Media** - Filter only active/published media
4. **Get by Type** - Filter by IMAGE or VIDEO type
5. **Update Media** - Modify title, description, order, or status
6. **Reorder Media** - Batch reorder by providing ordered list of IDs
7. **Get Count** - Check current media count (useful before adding)
8. **Delete Media** - Remove media from gallery

---

## 🔧 Kong Gateway Routes for Media Endpoints

Add these routes to Kong for media management:

```bash
# 1. Add Company Media
curl -X POST http://localhost:8001/services/company-service/routes \
  --data "name=company-add-media" \
  --data "paths[]=/company/media" \
  --data "methods[]=POST" \
  --data "strip_path=true"

# 2. Get All Media
curl -X POST http://localhost:8001/services/company-service/routes \
  --data "name=company-get-media" \
  --data "paths[]=/company/media" \
  --data "methods[]=GET" \
  --data "strip_path=true"

# 3. Get Active Media
curl -X POST http://localhost:8001/services/company-service/routes \
  --data "name=company-active-media" \
  --data "paths[]=/company/media/active" \
  --data "methods[]=GET" \
  --data "strip_path=true"

# 4. Get Media by Type
curl -X POST http://localhost:8001/services/company-service/routes \
  --data "name=company-media-by-type" \
  --data "paths[]=/company/media/type" \
  --data "methods[]=GET" \
  --data "strip_path=true"

# 5. Update Media
curl -X POST http://localhost:8001/services/company-service/routes \
  --data "name=company-update-media" \
  --data "paths[]=/company/media" \
  --data "methods[]=PUT" \
  --data "strip_path=true"

# 6. Delete Media
curl -X POST http://localhost:8001/services/company-service/routes \
  --data "name=company-delete-media" \
  --data "paths[]=/company/media" \
  --data "methods[]=DELETE" \
  --data "strip_path=true"

# 7. Reorder Media
curl -X POST http://localhost:8001/services/company-service/routes \
  --data "name=company-reorder-media" \
  --data "paths[]=/company/media/reorder" \
  --data "methods[]=PUT" \
  --data "strip_path=true"

# 8. Get Media Count
curl -X POST http://localhost:8001/services/company-service/routes \
  --data "name=company-media-count" \
  --data "paths[]=/company/media/count" \
  --data "methods[]=GET" \
  --data "strip_path=true"
```

---

## 🎉 Done!

Your Company Service is now fully functional with profile management and media gallery features!
