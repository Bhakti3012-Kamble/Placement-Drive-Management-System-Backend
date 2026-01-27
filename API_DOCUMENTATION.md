# PlacementPortal Backend API Documentation

## Base URL
```
http://localhost:5000/api/v1
```

## Authentication
Most endpoints require a JWT token. Include it in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

---

## 📌 Authentication Endpoints

### Register User
**POST** `/auth/register`

**Access:** Public

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "student"
}
```

**Validation:**
- `name`: Required, 2-50 characters
- `email`: Required, valid email format
- `password`: Required, minimum 6 characters
- `role`: Optional, must be `student`, `company`, or `admin` (default: `student`)

**Response (201):**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "60d5ec49f1b2c72b8c8e4f3a",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "student"
  }
}
```

---

### Login User
**POST** `/auth/login`

**Access:** Public

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Validation:**
- `email`: Required, valid email format
- `password`: Required

**Response (200):**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "60d5ec49f1b2c72b8c8e4f3a",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "student"
  }
}
```

---

### Get Current User
**GET** `/auth/me`

**Access:** Private (requires authentication)

**Response (200):**
```json
{
  "success": true,
  "data": {
    "_id": "60d5ec49f1b2c72b8c8e4f3a",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "student",
    "createdAt": "2024-01-20T10:30:00.000Z"
  }
}
```

---

### Forgot Password
**POST** `/auth/forgot-password`

**Access:** Public

**Request Body:**
```json
{
  "email": "john@example.com"
}
```

**Validation:**
- `email`: Required, valid email format

**Response (200):**
```json
{
  "success": true,
  "message": "Email sent",
  "resetToken": "a1b2c3d4e5f6..."
}
```

---

### Reset Password
**PUT** `/auth/reset-password/:resettoken`

**Access:** Public

**Request Body:**
```json
{
  "password": "newpassword123"
}
```

**Validation:**
- `password`: Required, minimum 6 characters

**Response (200):**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "60d5ec49f1b2c72b8c8e4f3a",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "student"
  }
}
```

---

## 🎓 Student Endpoints

### Get All Students (Admin Only)
**GET** `/students`

**Access:** Private (Admin only)

**Response (200):**
```json
{
  "success": true,
  "count": 2,
  "data": [
    {
      "_id": "60d5ec49f1b2c72b8c8e4f3b",
      "user": {
        "_id": "60d5ec49f1b2c72b8c8e4f3a",
        "name": "John Doe",
        "email": "john@example.com",
        "role": "student"
      },
      "rollNo": "CS2021001",
      "branch": "Computer Science",
      "cgpa": 8.5,
      "skills": ["JavaScript", "React", "Node.js"],
      "resume": "resume_60d5ec49f1b2c72b8c8e4f3b.pdf",
      "applications": []
    }
  ]
}
```

---

### Get Student Profile
**GET** `/students/me`

**Access:** Private (Student only)

**Response (200):**
```json
{
  "success": true,
  "data": {
    "_id": "60d5ec49f1b2c72b8c8e4f3b",
    "user": {
      "_id": "60d5ec49f1b2c72b8c8e4f3a",
      "name": "John Doe",
      "email": "john@example.com"
    },
    "rollNo": "CS2021001",
    "branch": "Computer Science",
    "cgpa": 8.5,
    "skills": ["JavaScript", "React", "Node.js"],
    "resume": "resume_60d5ec49f1b2c72b8c8e4f3b.pdf",
    "applications": []
  }
}
```

---

### Update Student Profile
**PUT** `/students/me`

**Access:** Private (Student only)

**Request Body:**
```json
{
  "rollNo": "CS2021001",
  "branch": "Computer Science",
  "cgpa": 8.5,
  "skills": ["JavaScript", "React", "Node.js"]
}
```

**Validation:**
- `rollNo`: Optional, 1-20 characters
- `branch`: Optional, 2-50 characters
- `cgpa`: Optional, 0-10
- `skills`: Optional, must be an array

**Response (200):**
```json
{
  "success": true,
  "data": {
    "_id": "60d5ec49f1b2c72b8c8e4f3b",
    "user": "60d5ec49f1b2c72b8c8e4f3a",
    "rollNo": "CS2021001",
    "branch": "Computer Science",
    "cgpa": 8.5,
    "skills": ["JavaScript", "React", "Node.js"]
  }
}
```

---

### Apply for Job
**POST** `/students/apply/:jobId`

**Access:** Private (Student only)

**Response (200):**
```json
{
  "success": true,
  "message": "Applied successfully"
}
```

**Error (400):**
```json
{
  "success": false,
  "error": "Already applied for this job"
}
```

---

### Upload Resume
**PUT** `/students/resume`

**Access:** Private (Student only)

**Request:** Multipart form data with file field named `resume`

**Validation:**
- File must be PDF format
- Maximum file size: 5MB

**Response (200):**
```json
{
  "success": true,
  "data": "resume_60d5ec49f1b2c72b8c8e4f3b.pdf"
}
```

---

### Update Application Status
**PUT** `/students/application/:jobId/:studentId`

**Access:** Private (Company/Admin only)

**Request Body:**
```json
{
  "status": "shortlisted"
}
```

**Validation:**
- `status`: Required, must be `applied`, `shortlisted`, `accepted`, or `rejected`

**Response (200):**
```json
{
  "success": true,
  "message": "Application status updated",
  "data": {
    "job": "60d5ec49f1b2c72b8c8e4f3c",
    "status": "shortlisted",
    "appliedAt": "2024-01-20T10:30:00.000Z"
  }
}
```

---

## 💼 Job Endpoints

### Get All Jobs
**GET** `/jobs`

**Access:** Public

**Query Parameters:**
- `search`: Search by title or description
- `status`: Filter by status (`open` or `closed`)
- `location`: Filter by location
- `sort`: Sort by field (e.g., `-createdAt`, `salary`)
- `page`: Page number (default: 1)
- `limit`: Results per page (default: 10)

**Example:**
```
GET /jobs?search=developer&status=open&page=1&limit=5
```

**Response (200):**
```json
{
  "success": true,
  "count": 5,
  "pagination": {
    "next": {
      "page": 2,
      "limit": 5
    }
  },
  "data": [
    {
      "_id": "60d5ec49f1b2c72b8c8e4f3c",
      "title": "Software Developer",
      "description": "Looking for talented developers...",
      "company": {
        "_id": "60d5ec49f1b2c72b8c8e4f3d",
        "name": "Tech Corp",
        "email": "hr@techcorp.com"
      },
      "requirements": ["JavaScript", "React", "Node.js"],
      "location": "Bangalore",
      "salary": "8-12 LPA",
      "deadline": "2024-02-15T23:59:59.000Z",
      "status": "open",
      "createdAt": "2024-01-20T10:30:00.000Z"
    }
  ]
}
```

---

### Get Single Job
**GET** `/jobs/:id`

**Access:** Public

**Response (200):**
```json
{
  "success": true,
  "data": {
    "_id": "60d5ec49f1b2c72b8c8e4f3c",
    "title": "Software Developer",
    "description": "Looking for talented developers...",
    "company": {
      "_id": "60d5ec49f1b2c72b8c8e4f3d",
      "name": "Tech Corp",
      "email": "hr@techcorp.com"
    },
    "requirements": ["JavaScript", "React", "Node.js"],
    "location": "Bangalore",
    "salary": "8-12 LPA",
    "deadline": "2024-02-15T23:59:59.000Z",
    "status": "open",
    "createdAt": "2024-01-20T10:30:00.000Z"
  }
}
```

---

### Create Job
**POST** `/jobs`

**Access:** Private (Company/Admin only)

**Request Body:**
```json
{
  "title": "Software Developer",
  "description": "Looking for talented developers with 2+ years experience",
  "requirements": ["JavaScript", "React", "Node.js"],
  "location": "Bangalore",
  "salary": "8-12 LPA",
  "deadline": "2024-02-15T23:59:59.000Z",
  "status": "open"
}
```

**Validation:**
- `title`: Required, 3-100 characters
- `description`: Required, minimum 10 characters
- `requirements`: Required, must be an array with at least 1 item
- `location`: Required, 2-100 characters
- `salary`: Required
- `deadline`: Required, must be a valid future date
- `status`: Optional, must be `open` or `closed`

**Response (201):**
```json
{
  "success": true,
  "data": {
    "_id": "60d5ec49f1b2c72b8c8e4f3c",
    "title": "Software Developer",
    "description": "Looking for talented developers...",
    "company": "60d5ec49f1b2c72b8c8e4f3d",
    "requirements": ["JavaScript", "React", "Node.js"],
    "location": "Bangalore",
    "salary": "8-12 LPA",
    "deadline": "2024-02-15T23:59:59.000Z",
    "status": "open",
    "createdAt": "2024-01-20T10:30:00.000Z"
  }
}
```

---

### Update Job
**PUT** `/jobs/:id`

**Access:** Private (Company/Admin only - must be job owner)

**Request Body:** Same as Create Job

**Response (200):**
```json
{
  "success": true,
  "data": {
    "_id": "60d5ec49f1b2c72b8c8e4f3c",
    "title": "Senior Software Developer",
    "description": "Updated description...",
    "company": "60d5ec49f1b2c72b8c8e4f3d",
    "requirements": ["JavaScript", "React", "Node.js", "TypeScript"],
    "location": "Bangalore",
    "salary": "10-15 LPA",
    "deadline": "2024-02-20T23:59:59.000Z",
    "status": "open"
  }
}
```

---

### Delete Job
**DELETE** `/jobs/:id`

**Access:** Private (Company/Admin only - must be job owner)

**Response (200):**
```json
{
  "success": true,
  "data": {}
}
```

---

### Get Job Applications
**GET** `/jobs/:id/applications`

**Access:** Private (Company/Admin only - must be job owner)

**Response (200):**
```json
{
  "success": true,
  "count": 3,
  "data": [
    {
      "studentId": "60d5ec49f1b2c72b8c8e4f3b",
      "name": "John Doe",
      "email": "john@example.com",
      "cgpa": 8.5,
      "resume": "resume_60d5ec49f1b2c72b8c8e4f3b.pdf",
      "status": "applied",
      "appliedAt": "2024-01-20T10:30:00.000Z"
    }
  ]
}
```

---

## 🔒 Error Responses

### Validation Error (400)
```json
{
  "success": false,
  "errors": [
    {
      "field": "email",
      "message": "Please provide a valid email"
    },
    {
      "field": "password",
      "message": "Password must be at least 6 characters"
    }
  ]
}
```

### Unauthorized (401)
```json
{
  "success": false,
  "message": "Not authorized to access this route"
}
```

### Forbidden (403)
```json
{
  "success": false,
  "message": "User role student is not authorized to access this route"
}
```

### Not Found (404)
```json
{
  "success": false,
  "error": "Resource not found with id of 60d5ec49f1b2c72b8c8e4f3a"
}
```

### Server Error (500)
```json
{
  "success": false,
  "error": "Server Error",
  "stack": "Error stack trace (only in development mode)"
}
```

---

## 📝 Notes

1. **Authentication**: Store the JWT token received from login/register and include it in the `Authorization` header for protected routes
2. **File Uploads**: Use `multipart/form-data` content type for resume uploads
3. **Pagination**: Use `page` and `limit` query parameters to navigate through large result sets
4. **Search & Filter**: Combine multiple query parameters for advanced filtering
5. **Email Notifications**: Automatic emails are sent for:
   - User registration (welcome email)
   - Password reset requests
   - Application status updates
