# 📡 API Documentation

Complete reference for all API endpoints in Projectready4U.

---

## Base URL

```
Local:       http://localhost:3000/api
Production:  https://yoursite.com/api
```

---

## Authentication

### Admin Routes
Protected routes require:
1. Valid Supabase auth session (login at `/admin`)
2. Session stored in `sb-access-token` cookie
3. Middleware redirects to `/admin` if not authenticated

### Public Routes
No authentication required for:
- Fetching projects
- Submitting access requests

---

## Endpoints

### 1. Create Access Request

**POST** `/api/requests`

Submit a student request to access a project.

#### Request Body

```json
{
  "project_id": "uuid",
  "project_title": "Smart Attendance System",
  "full_name": "John Doe",
  "email": "john@example.com",
  "phone": "9876543210",
  "whatsapp_number": "9876543210",
  "college": "MIT Pune",
  "city": "Pune",
  "state": "Maharashtra",
  "traffic_source": "youtube",
  "utm_source": "youtube_search",
  "message": "Very interested in this project"
}
```

#### Field Validation

| Field | Type | Rules | Example |
|-------|------|-------|---------|
| project_id | UUID | Valid project UUID | `550e8400-e29b-41d4-a716-446655440000` |
| project_title | String | Non-empty | `Smart Attendance System` |
| full_name | String | 2-50 chars | `John Doe` |
| email | String | Valid email | `john@example.com` |
| phone | String | Exactly 10 digits | `9876543210` |
| whatsapp_number | String | Exactly 10 digits | `9876543210` |
| college | String | Non-empty | `MIT Pune` |
| city | String | Non-empty | `Pune` |
| state | String | From list | `Maharashtra` |
| traffic_source | String | youtube\|google\|whatsapp\|friend\|other | `youtube` |
| utm_source | String | Optional | `youtube_search` |
| message | String | Optional | `Interested in this` |

#### Success Response (200)

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "project_id": "550e8400-e29b-41d4-a716-446655440001",
  "full_name": "John Doe",
  "email": "john@example.com",
  "phone": "9876543210",
  "status": "pending",
  "requested_at": "2024-01-15T10:30:00Z",
  "approved_at": null
}
```

#### Error Responses

**400 Bad Request** - Validation failed
```json
{
  "error": "Invalid email format",
  "field": "email"
}
```

**429 Too Many Requests** - Rate limit exceeded
```json
{
  "error": "Too many requests. Maximum 3 requests per email per 24 hours"
}
```

**500 Internal Server Error** - Database error
```json
{
  "error": "Failed to create request",
  "details": "Database connection error"
}
```

#### Rate Limiting

- **Limit:** 3 requests per email per 24 hours
- **Check:** Based on email address
- **Reset:** Automatic after 24 hours

#### Email Notification

When a request is created:
1. Admin receives email with:
   - Student details
   - Project name
   - WhatsApp button link
   - Dashboard link to approve
2. Student receives confirmation (when approved)

#### Example Usage (JavaScript)

```javascript
// In RequestModal.tsx form submission
const response = await fetch('/api/requests', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    project_id: projectId,
    project_title: projectTitle,
    full_name: formData.fullName,
    email: formData.email,
    phone: formData.phone,
    whatsapp_number: formData.whatsapp || formData.phone,
    college: formData.college,
    city: formData.city,
    state: formData.state,
    traffic_source: formData.trafficSource,
    utm_source: getUTMParam('utm_source'),
    message: formData.message
  })
});

const result = await response.json();
if (!response.ok) {
  throw new Error(result.error);
}
return result; // Insert data
```

---

### 2. Approve Access Request

**POST** `/api/approve`

Admin-only endpoint to approve a request and send download link.

#### Requirements

- Must be authenticated as admin
- Valid `sb-access-token` cookie (auto-set after login)
- Request must exist with `pending` status

#### Request Body

```json
{
  "request_id": "550e8400-e29b-41d4-a716-446655440000",
  "access_link": "https://github.com/user/project/releases/download/v1.0/file.zip"
}
```

#### Field Validation

| Field | Type | Rules | Example |
|-------|------|-------|---------|
| request_id | UUID | Must exist and be pending | `550e8400-e29b-41d4-a716-446655440000` |
| access_link | URL | Valid GitHub release URL | `https://github.com/user/repo/releases/download/v1.0/file.zip` |

#### Success Response (200)

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "status": "approved",
  "approved_at": "2024-01-15T10:35:00Z",
  "access_link": "https://github.com/user/repo/releases/download/v1.0/file.zip"
}
```

#### Error Responses

**400 Bad Request** - Invalid data
```json
{
  "error": "Request not found or already approved"
}
```

**401 Unauthorized** - Not authenticated
```json
{
  "error": "Not authenticated",
  "redirect": "/admin"
}
```

**500 Internal Server Error** - Server error
```json
{
  "error": "Failed to approve request"
}
```

#### Email Notification

When approved, student receives:
1. Subject: "Your Project Access Approved ✓"
2. Contents:
   - Congratulations message
   - Download button with access link
   - List of included files
   - Setup instructions
   - Support link

#### Example Usage (TypeScript)

```typescript
// Admin dashboard approval
async function approveRequest(
  requestId: string,
  accessLink: string
) {
  const response = await fetch('/api/approve', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      request_id: requestId,
      access_link: accessLink
    })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error);
  }

  return await response.json();
}
```

---

## Database Queries (Not API, but used internally)

### Available Functions in `src/lib/supabase.ts`

#### fetchAllProjects()
Get all projects for listing page.

```typescript
const projects = await fetchAllProjects();
// Returns: Project[]
```

#### fetchProjectBySlug(slug)
Get single project for detail page with SEO.

```typescript
const project = await fetchProjectBySlug('smart-attendance-system');
// Returns: Project | null
```

#### fetchFeaturedProjects(limit = 3)
Get top featured projects for home page.

```typescript
const featured = await fetchFeaturedProjects(3);
// Returns: Project[]
```

#### createRequest(request)
Create new student request (used by `/api/requests`).

```typescript
const newRequest = await createRequest({
  project_id: 'uuid',
  full_name: 'John Doe',
  // ... other fields
});
// Returns: inserted request with ID
```

#### fetchRequestsByStatus(status)
Get requests by status for admin dashboard.

```typescript
const pending = await fetchRequestsByStatus('pending');
const approved = await fetchRequestsByStatus('approved');
// Returns: Request[]
```

#### fetchRecentRequests(limit = 10)
Get most recent requests for dashboard table.

```typescript
const recent = await fetchRecentRequests(10);
// Returns: Request[] (ordered by date)
```

#### approveRequest(id, accessLink)
Update request to approved status (used by `/api/approve`).

```typescript
await approveRequest('request-uuid', 'https://github.com/.../file.zip');
// Returns: updated request
```

#### rejectRequest(id)
Reject a pending request.

```typescript
await rejectRequest('request-uuid');
// Returns: updated request
```

---

## Rate Limiting

### Request Endpoint

**Limit:** 3 requests per email per 24 hours

**Checked at:**
- POST `/api/requests`

**How it works:**
1. Extract email from request body
2. Query Supabase for requests from that email in last 24h
3. If count >= 3, return 429 error
4. Otherwise, create new request

**Example:**
```
Hour 1: john@email.com makes request #1 ✓
Hour 2: john@email.com makes request #2 ✓
Hour 3: john@email.com makes request #3 ✓
Hour 4: john@email.com makes request #4 ✗ (429 Too Many Requests)
```

### Approval Endpoint

No rate limiting (admin-controlled).

---

## Headers

### Requests

```
Content-Type: application/json
```

### Responses

```
Content-Type: application/json
```

---

## Status Codes

| Code | Meaning | Example |
|------|---------|---------|
| 200 | Success | Request created/approved |
| 400 | Bad Request | Invalid email format |
| 401 | Unauthorized | Not logged in |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Server Error | Database connection failed |

---

## Data Types

### Project

```typescript
interface Project {
  id: string; // UUID
  title: string;
  slug: string; // URL-safe identifier
  category: string; // 'Web', 'Android', 'Python', etc.
  description: string;
  abstract: string;
  synopsis: string;
  price: number; // In INR
  discounted_price: number;
  youtube_link: string; // Full URL
  github_repo_link: string;
  github_release_zip_url: string; // Download link
  thumbnail_url: string;
  includes_source: boolean;
  includes_report: boolean;
  includes_ppt: boolean;
  includes_synopsis: boolean;
  includes_viva: boolean;
  includes_readme: boolean;
  created_at: string; // ISO 8601
}
```

### Request

```typescript
interface Request {
  id: string; // UUID
  project_id: string;
  project_title: string;
  full_name: string;
  email: string;
  phone: string; // 10 digits
  whatsapp_number: string;
  college: string;
  city: string;
  state: string;
  traffic_source: string; // 'youtube', 'google', etc.
  utm_source: string; // Optional tracking
  message: string; // Optional
  status: 'pending' | 'approved' | 'rejected';
  access_link: string; // GitHub release URL
  requested_at: string; // ISO 8601
  approved_at: string | null; // ISO 8601 or null
}
```

---

## Error Handling Best Practices

### Client-Side

```typescript
try {
  const response = await fetch('/api/requests', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });

  if (!response.ok) {
    const error = await response.json();
    console.error(error.error); // Show to user
    toast.error(error.error);
    return;
  }

  const result = await response.json();
  toast.success('Request submitted!');
  setShowSuccess(true);
} catch (error) {
  console.error('Network error:', error);
  toast.error('Network error. Please try again.');
}
```

### Server-Side (Logging)

```typescript
// In API routes
console.error('Request creation failed:', {
  email: data.email,
  error: error.message,
  timestamp: new Date().toISOString()
});
```

---

## Testing Endpoints

### Using cURL

```bash
# Create request
curl -X POST http://localhost:3000/api/requests \
  -H "Content-Type: application/json" \
  -d '{
    "project_id": "550e8400-e29b-41d4-a716-446655440000",
    "project_title": "Test Project",
    "full_name": "Test User",
    "email": "test@example.com",
    "phone": "9876543210",
    "whatsapp_number": "9876543210",
    "college": "Test College",
    "city": "Test City",
    "state": "Maharashtra",
    "traffic_source": "other"
  }'
```

### Using Postman

1. Create new POST request
2. URL: `http://localhost:3000/api/requests`
3. Headers: `Content-Type: application/json`
4. Body (raw JSON): Copy request body from above
5. Send

### Using JavaScript

```javascript
const data = {
  project_id: '550e8400-e29b-41d4-a716-446655440000',
  full_name: 'John Doe',
  email: 'john@example.com',
  phone: '9876543210',
  whatsapp_number: '9876543210',
  college: 'MIT Pune',
  city: 'Pune',
  state: 'Maharashtra',
  traffic_source: 'youtube',
  project_title: 'Smart Attendance'
};

fetch('/api/requests', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(data)
})
.then(r => r.json())
.then(console.log)
.catch(console.error);
```

---

## Webhook Notifications (Future)

Currently, notifications are sent via Resend email. Future enhancements could include:

- Webhook to external service when request created
- Slack notification to admin
- SMS notification via Twilio
- Discord bot updates

---

## Pagination (Future)

Current implementation returns all results. For production with many requests:

```typescript
// Future: Add pagination
GET /api/requests?page=1&limit=20
GET /api/projects?page=1&limit=12
```

---

## API Versioning (Future)

Current version: `v1` (implicit)

Future versions could be:
```
/api/v1/requests
/api/v2/requests
```

---

## Need Help?

- Check implementations: `src/app/api/`
- See database logic: `src/lib/supabase.ts`
- Review components: `src/components/RequestModal.tsx`
- Check middleware: `src/middleware.ts`
