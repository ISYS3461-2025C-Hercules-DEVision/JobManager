# Kong Gateway Setup via Web Interface
## Step-by-Step Guide for Subscription & Payment Services

This guide shows you EXACTLY how to configure Kong using the **Kong Manager Web Interface** at http://localhost:8002, following the same pattern as your existing Company Service.

---

## Understanding Your Service Structure

### Company Service (Existing - Port 8082)
```java
@RestController
@RequestMapping("/")  // ← Base path is ROOT
public class CompanyController {
    @GetMapping("/profile/status")  // ← Full path: /profile/status
    @GetMapping("/profile")          // ← Full path: /profile
}
```

**Kong Configuration:**
- Service URL: `http://localhost:8082`
- Route Path: `/company`
- Strip Path: `true` (removes `/company` prefix, forwards to `/`)

**Result:**
```
Client calls: http://localhost:8000/company/profile/status
Kong strips: /company
Forwards to: http://localhost:8082/profile/status ✅
```

---

### Subscription Service (New - Port 8083)
```java
@RestController
@RequestMapping("/subscriptions")  // ← Base path is /subscriptions
public class SubscriptionController {
    @PostMapping                     // ← Full path: /subscriptions
    @GetMapping("/{id}")             // ← Full path: /subscriptions/{id}
    @GetMapping("/company/{companyId}") // ← Full path: /subscriptions/company/{id}
}
```

**Kong Configuration:**
- Service URL: `http://host.docker.internal:8083`
- Route Path: `/subscriptions`
- Strip Path: `false` (keeps `/subscriptions` when forwarding)

**Result:**
```
Client calls: http://localhost:8000/subscriptions/company/123
Kong keeps: /subscriptions
Forwards to: http://localhost:8083/subscriptions/company/123 ✅
```

---

### Payment Service (New - Port 8084)
```java
@RestController
@RequestMapping("/payments")  // ← Base path is /payments
public class PaymentController {
    @PostMapping("/initiate")   // ← Full path: /payments/initiate
    @GetMapping("/complete")    // ← Full path: /payments/complete
}

@RestController
@RequestMapping("/webhook")  // ← Different controller
public class StripeWebhookController {
    @PostMapping("/stripe")  // ← Full path: /webhook/stripe
}
```

**Kong Configuration:**
- Service URL: `http://host.docker.internal:8084`
- Route Path 1: `/payments` (strip_path=false)
- Route Path 2: `/webhook` (strip_path=false, separate route for webhooks)

---

## Step 1: Access Kong Manager

1. Open your web browser
2. Go to: **http://localhost:8002**
3. You should see the Kong Manager dashboard

---

## Step 2: Create Subscription Service

### 2.1 Navigate to Services

1. Click **"Services"** in the left sidebar
2. Click the **"New Service"** button (top right)

### 2.2 Fill in Service Details

In the form that appears:

| Field | Value | Notes |
|-------|-------|-------|
| **Name** | `subscription-service` | Must be unique |
| **Tags** | (leave empty) | Optional |
| **URL** | `http://host.docker.internal:8083` | If Kong is in Docker, services on host |
| **OR use these fields separately:** | | |
| **Protocol** | `http` | |
| **Host** | `host.docker.internal` | Or `localhost` if Kong runs on host |
| **Port** | `8083` | |
| **Path** | `/` | Leave as root |
| **Retries** | `5` | Default |
| **Connect timeout** | `60000` | milliseconds |
| **Write timeout** | `60000` | milliseconds |
| **Read timeout** | `60000` | milliseconds |

3. Click **"Create"** button at the bottom

**Screenshot Guide:**
```
┌─────────────────────────────────────────┐
│  Name: subscription-service             │
│  Protocol: http                         │
│  Host: host.docker.internal             │
│  Port: 8083                             │
│  Path: /                                │
│                                         │
│  [Create Button]                        │
└─────────────────────────────────────────┘
```

---

## Step 3: Create Routes for Subscription Service

### 3.1 Navigate to Routes

1. After creating the service, you'll be on the service detail page
2. Click the **"Routes"** tab (near the top)
3. Click **"Add Route"** button

### 3.2 Configure Subscription Route

In the Add Route form:

| Field | Value | Notes |
|-------|-------|-------|
| **Name** | `subscription-routes` | Descriptive name |
| **Tags** | (leave empty) | Optional |
| **Protocols** | ☑ `http` ☑ `https` | Check both boxes |
| **Methods** | ☑ `GET` ☑ `POST` ☑ `PUT` ☑ `DELETE` | Check all that apply |
| **Paths** | `/subscriptions` | Click "+ Add Path" button first |
| **Strip Path** | ☐ **UNCHECKED** (false) | **IMPORTANT!** Leave unchecked |
| **Preserve Host** | ☐ Unchecked | Default |
| **Regex Priority** | `0` | Default |

**CRITICAL:** Make sure **Strip Path is UNCHECKED** (false) for this to work!

3. Click **"Create"**

**Screenshot Guide:**
```
┌─────────────────────────────────────────┐
│  Name: subscription-routes              │
│  Protocols: [✓] http [✓] https          │
│  Methods: [✓] GET [✓] POST [✓] PUT      │
│           [✓] DELETE                    │
│  Paths:                                 │
│    /subscriptions         [+ Add Path]  │
│  Strip Path: [ ] (UNCHECKED)            │
│  Preserve Host: [ ]                     │
│                                         │
│  [Create Button]                        │
└─────────────────────────────────────────┘
```

---

## Step 4: Create Payment Service

### 4.1 Navigate Back to Services

1. Click **"Services"** in the left sidebar
2. Click **"New Service"** button

### 4.2 Fill in Payment Service Details

| Field | Value |
|-------|-------|
| **Name** | `payment-service` |
| **Protocol** | `http` |
| **Host** | `host.docker.internal` |
| **Port** | `8084` |
| **Path** | `/` |
| **Retries** | `5` |
| **Connect timeout** | `60000` |
| **Write timeout** | `60000` |
| **Read timeout** | `60000` |

3. Click **"Create"**

---

## Step 5: Create Routes for Payment Service

### 5.1 Main Payment Routes

1. Go to the `payment-service` detail page
2. Click **"Routes"** tab
3. Click **"Add Route"**

Configure:

| Field | Value |
|-------|-------|
| **Name** | `payment-routes` |
| **Protocols** | ☑ `http` ☑ `https` |
| **Methods** | ☑ `GET` ☑ `POST` ☑ `PUT` ☑ `DELETE` |
| **Paths** | `/payments` |
| **Strip Path** | ☐ **UNCHECKED** (false) |

4. Click **"Create"**

### 5.2 Webhook Route (Separate Route)

1. Stay on the `payment-service` Routes tab
2. Click **"Add Route"** again (to add a second route)

Configure:

| Field | Value |
|-------|-------|
| **Name** | `webhook-stripe-route` |
| **Protocols** | ☑ `http` ☑ `https` |
| **Methods** | ☑ `POST` (ONLY POST) |
| **Paths** | `/webhook` |
| **Strip Path** | ☐ **UNCHECKED** (false) |

**Important:** This route will handle `/webhook/stripe` endpoint without JWT authentication (we'll configure JWT plugin later to exclude this route).

4. Click **"Create"**

---

## Step 6: Verify Configuration

### 6.1 Check Services

1. Click **"Services"** in sidebar
2. You should see:
   - `subscription-service` → `http://host.docker.internal:8083`
   - `payment-service` → `http://host.docker.internal:8084`

### 6.2 Check Routes

1. Click **"Routes"** in sidebar
2. You should see:
   - `subscription-routes` → `/subscriptions` (service: subscription-service)
   - `payment-routes` → `/payments` (service: payment-service)
   - `webhook-stripe-route` → `/webhook` (service: payment-service)

---

## Step 7: Test the Configuration

### 7.1 Test Subscription Service

Open a new PowerShell terminal:

```powershell
# Test through Kong (should work if service is running)
Invoke-RestMethod -Uri "http://localhost:8000/subscriptions" `
  -Method GET `
  -Headers @{ "Authorization" = "Bearer your-token-here" }
```

**Expected:** Should reach your Subscription Service on port 8083

### 7.2 Test Payment Service

```powershell
# Test through Kong
Invoke-RestMethod -Uri "http://localhost:8000/payments/initiate" `
  -Method POST `
  -Headers @{ "Authorization" = "Bearer your-token-here" } `
  -ContentType "application/json" `
  -Body '{"subsystem":"JOB_MANAGER","paymentType":"SUBSCRIPTION","amount":3000}'
```

**Expected:** Should reach your Payment Service on port 8084

### 7.3 Compare with Direct Access

```powershell
# Direct to service (bypass Kong)
Invoke-RestMethod -Uri "http://localhost:8083/subscriptions" `
  -Method GET `
  -Headers @{ "Authorization" = "Bearer your-token-here" }
```

Both should return the same response!

---

## Step 8: Optional - Add JWT Plugin

### 8.1 Navigate to Subscription Route Plugins

1. Click **"Routes"** in sidebar
2. Find and click **"subscription-routes"**
3. Click the **"Plugins"** tab
4. Click **"Add Plugin"**

### 8.2 Enable JWT Plugin

1. In the plugin list, find **"JWT"** (under Authentication section)
2. Click **"Enable"**

Configure:

| Field | Value | Notes |
|-------|-------|-------|
| **URI param names** | (leave empty) | Token in header, not URL |
| **Cookie names** | (leave empty) | Token in header, not cookie |
| **Header names** | `authorization` | Default - token in Authorization header |
| **Claims to verify** | (leave empty) | Or add `exp` for expiration check |
| **Key claim name** | `iss` | JWT issuer claim |
| **Secret is Base64** | ☐ Unchecked | Unless your JWT secret is base64 |
| **Maximum expiration** | (leave empty) | Optional |

3. Click **"Create"**

### 8.3 Repeat for Payment Routes

1. Go to **Routes** → **"payment-routes"**
2. Click **"Plugins"** tab → **"Add Plugin"**
3. Enable **"JWT"** plugin with same settings

**DO NOT add JWT plugin to `webhook-stripe-route`** - Stripe uses signature verification!

---

## Comparison: Company Service vs. Your Services

### Company Service Pattern
```
Controller: @RequestMapping("/")
Endpoints: /profile/status, /profile, /public-profile

Kong Route: /company (strip_path=true)
Result: /company/profile → strips /company → forwards /profile
```

### Subscription Service Pattern
```
Controller: @RequestMapping("/subscriptions")
Endpoints: /subscriptions, /subscriptions/{id}, /subscriptions/company/{id}

Kong Route: /subscriptions (strip_path=false)
Result: /subscriptions/company/123 → keeps path → forwards /subscriptions/company/123
```

**Key Difference:** Your controllers already include `/subscriptions` and `/payments` in `@RequestMapping`, so Kong should NOT strip the path!

---

## Troubleshooting via Web Interface

### Issue 1: Routes Not Showing Up

1. Go to http://localhost:8002
2. Click **"Routes"** in sidebar
3. If empty, routes weren't created - go back to Step 3

### Issue 2: 404 Not Found

**Check Strip Path Setting:**

1. Go to **Routes** → Click your route name
2. Look for **"Strip Path"** field
3. It should be **UNCHECKED** (false) for your services
4. If it's checked, click **"Edit"** button (top right)
5. Uncheck **"Strip Path"**
6. Click **"Update"**

### Issue 3: Service Not Reachable

**Check Service URL:**

1. Go to **Services** → Click service name
2. Verify:
   - Host: `host.docker.internal` (if Kong in Docker, services on host machine)
   - Port: `8083` or `8084`
3. If wrong, click **"Edit"** → Update → **"Update"**

**Test from Kong container:**
```powershell
# Check if Kong can reach your service
docker exec -it kong-gateway curl http://host.docker.internal:8083/subscriptions
```

### Issue 4: Check Kong Admin API (Alternative)

You can also check configuration using the Admin API:

**In your browser, navigate to:**

- Services: `http://localhost:8001/services`
- Routes: `http://localhost:8001/routes`

This shows raw JSON configuration if web UI isn't clear.

---

## Quick Reference Card

### URL Mapping Table

| Client Request | Kong Matches | Forwards To | Service |
|----------------|--------------|-------------|---------|
| `http://localhost:8000/subscriptions` | `/subscriptions` | `http://localhost:8083/subscriptions` | Subscription |
| `http://localhost:8000/subscriptions/company/123` | `/subscriptions` | `http://localhost:8083/subscriptions/company/123` | Subscription |
| `http://localhost:8000/payments/initiate` | `/payments` | `http://localhost:8084/payments/initiate` | Payment |
| `http://localhost:8000/payments/complete` | `/payments` | `http://localhost:8084/payments/complete` | Payment |
| `http://localhost:8000/webhook/stripe` | `/webhook` | `http://localhost:8084/webhook/stripe` | Payment |

### Configuration Summary

```
┌─────────────────────────────────────────────────────────┐
│ SUBSCRIPTION SERVICE                                    │
├─────────────────────────────────────────────────────────┤
│ Service Name: subscription-service                      │
│ Host: host.docker.internal:8083                         │
│ Route Path: /subscriptions                              │
│ Strip Path: FALSE ✅                                    │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ PAYMENT SERVICE                                         │
├─────────────────────────────────────────────────────────┤
│ Service Name: payment-service                           │
│ Host: host.docker.internal:8084                         │
│ Route 1: /payments (strip_path=false) ✅                │
│ Route 2: /webhook (strip_path=false) ✅                 │
└─────────────────────────────────────────────────────────┘
```

---

## Success Checklist

Before testing, verify in Kong Manager (http://localhost:8002):

- [ ] `subscription-service` created with correct host:port
- [ ] `subscription-routes` created with path `/subscriptions` and **strip_path=false**
- [ ] `payment-service` created with correct host:port
- [ ] `payment-routes` created with path `/payments` and **strip_path=false**
- [ ] `webhook-stripe-route` created with path `/webhook` and **strip_path=false**
- [ ] JWT plugin added to subscription and payment routes (optional)
- [ ] JWT plugin NOT added to webhook route
- [ ] Test requests work: `http://localhost:8000/subscriptions`
- [ ] Test requests work: `http://localhost:8000/payments/initiate`

---

## Next Steps

1. **Update Frontend Configuration** - Change base URLs from port 8083/8084 to 8000
2. **Add Rate Limiting** - In route plugins, add "Rate Limiting" plugin
3. **Add CORS** - In route plugins, add "CORS" plugin for frontend calls
4. **Monitor Traffic** - Kong Manager shows traffic analytics in dashboard

---

## Important Notes

⚠️ **Strip Path Setting:** This is the most common source of errors!
- Company Service: `strip_path=true` (because controller uses `@RequestMapping("/")`)
- Your Services: `strip_path=false` (because controller uses `@RequestMapping("/subscriptions")`)

⚠️ **Host Configuration:**
- Kong in Docker + Services on Host → Use `host.docker.internal`
- Kong on Host + Services on Host → Use `localhost`
- Kong in Docker + Services in Docker → Use service names from docker-compose

⚠️ **Webhook Route:** Do NOT add JWT plugin to webhook routes - they use different authentication!
