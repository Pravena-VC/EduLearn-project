# EduLearn Platform - Technical Documentation

## Overview

EduLearn is a modern e-learning platform built with a React/Next.js frontend and Django backend. This document provides a high-level overview of the architecture, development patterns, and code organization to help senior developers quickly understand the codebase.

## Tech Stack

### Frontend

- **Next.js 14+** with App Router
- **React** for UI components
- **TanStack Query** (React Query) for data fetching and state management
- **React Hook Form** for form handling
- **Shadcn/UI** for component library and styling
- **Zod** for form validation

### Backend

- **Django** REST framework
- **JWT** for authentication
- **File uploads** for course media (thumbnails, videos)

## Architecture Overview

### Backend Architecture

The backend follows a modular approach with distinct view files for different resource types:

1. **Authentication System** (`auth_views.py`)

   - JWT-based auth with access/refresh tokens
   - Student and Staff registration endpoints
   - Login & token refresh functionality

2. **Course Management** (`course_views.py`)
   - Class-based views for CRUD operations
   - Resource-oriented endpoints for courses, sections, lessons
   - Permission checks for instructors
   - File handling for thumbnails/videos

### Frontend Architecture

The frontend uses Next.js App Router with a well-structured directory organization:

1. **Public Pages**

   - `/courses`: Course catalog and details
   - `/login`, `/register`: Authentication

2. **Dashboard**

   - `/dashboard/instructor`: Instructor dashboard for course management
   - Nested routes for course creation, analytics, profile, settings

3. **Component Structure**
   - Shadcn/UI for consistent UI elements
   - Custom UI components built on top of Shadcn primitives

## Key Development Patterns

### Backend Patterns

1. **Class-based Views**

   - Each resource type (Course, Section, Lesson) has dedicated view classes
   - HTTP methods (`get`, `post`, `put`, `delete`) map to CRUD operations
   - Consistent pattern for authentication, permission checks, and responses

2. **JWT Authentication Flow**

   - Token generation and validation
   - Access and refresh token mechanism
   - User type differentiation (student vs. instructor)

3. **Error Handling**

   - Consistent error response structure
   - Try/except blocks with specific error codes
   - Descriptive error messages

4. **File Management**
   - Course thumbnails
   - Lesson video uploads
   - File cleanup on deletion

### Frontend Patterns

1. **TanStack Query**

   - API data fetching with caching
   - Loading states (`isLoading`, `isPending`)
   - Mutation handling for data modifications
   - Automatic refetching after mutations

2. **Form Management**

   - React Hook Form for complex forms
   - Zod schema validation
   - Form state management and error handling

3. **Component Structure**

   - Page components for routing
   - Reusable UI components
   - Layout components for consistent page structure

4. **Authentication & Authorization**
   - Token-based auth
   - Protected routes
   - User role-based access control

## API Routes

### Authentication

- `POST /api/auth/login/` - User login
- `POST /api/auth/register/student/` - Student registration
- `POST /api/auth/register/staff/` - Staff/instructor registration
- `POST /api/auth/token/refresh/` - Refresh access token

### Course Management

- `GET|POST /api/courses/` - List or create courses
- `GET|PUT|DELETE /api/courses/:id/` - Retrieve, update or delete course
- `POST /api/courses/:id/thumbnail/` - Upload course thumbnail
- `POST|PUT|DELETE /api/courses/:id/sections/` - Manage course sections
- `POST|PUT|DELETE /api/courses/:id/sections/:section_id/lessons/` - Manage lessons
- `POST /api/courses/:id/sections/:section_id/lessons/:lesson_id/video/` - Upload lesson video

## Workflow Examples

### Course Creation Flow

**Backend:**

1. `CourseListCreateView.post()` handles the initial course creation
2. Validates inputs and creates course object
3. Processes additional data (requirements, objectives)
4. Creates sections and lessons if provided
5. Returns detailed course data

**Frontend:**

1. Form captures course details using React Hook Form
2. Form submission handled by TanStack Query mutation
3. Loading states shown during submission
4. Success/error handling via toast notifications
5. Redirection after successful creation

### Video Upload Flow

**Backend:**

1. `LessonVideoUploadView.post()` handles video file upload
2. Validates instructor permissions
3. Handles file replacement if needed
4. Updates lesson metadata (duration)
5. Returns updated video URL

**Frontend:**

1. File input captures video selection
2. Upload mutation with form data
3. Progress tracking for large files
4. Preview generation after successful upload
5. Course content update with new video

## Development Guidelines

### Backend Development

1. **Adding New Endpoints**

   - Create class-based views following existing patterns
   - Use method decorators for CSRF exemption
   - Implement permission checks
   - Return consistent JSON responses

2. **Error Handling**

   - Use try/except blocks for all database operations
   - Return descriptive error messages with appropriate status codes
   - Handle file operations carefully

3. **File Operations**
   - Clean up old files when replacing
   - Use Django's file handling mechanisms
   - Validate file types and sizes

### Frontend Development

1. **Data Fetching**

   - Use TanStack Query hooks for API calls
   - Define query keys consistently
   - Handle loading and error states
   - Use mutations for data modifications

2. **Form Handling**

   - Use React Hook Form for complex forms
   - Define Zod schemas for validation
   - Handle form submission with TanStack Query mutations
   - Show appropriate loading states during submission

3. **UI Components**
   - Use Shadcn/UI components as base
   - Customize as needed for specific requirements
   - Maintain consistent design language

## Deployment Considerations

1. **Backend**

   - Configure Django for production
   - Set up proper file storage for media files
   - Configure database
   - Set up CORS for frontend communication

2. **Frontend**
   - Build and deploy Next.js application
   - Configure environment variables for API endpoints
   - Set up static asset delivery

## Conclusion

The EduLearn platform follows a clean, modular architecture with a clear separation of concerns. The backend provides a RESTful API with comprehensive endpoints for course management, while the frontend offers a responsive user interface built with modern React practices.

By following the patterns established in the codebase, developers can extend functionality while maintaining consistency and code quality.
