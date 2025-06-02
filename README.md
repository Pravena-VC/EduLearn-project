# EduLearn

A modern educational platform built with Django and Next.js, providing a seamless learning experience with features like course management, favorites, and user authentication.

## 🚀 Features

- 📚 Course Management
- 🌟 Favorite Courses
- 🔐 JWT Authentication
- 🎨 Dark/Light Mode
- 📱 Responsive Design
- 🔄 Real-time Updates

## 🛠 Tech Stack

### Backend
- Django 3.12
- Python 3.12
- SQLite
- JWT Authentication
- RESTful API

### Frontend
- Next.js
- TypeScript
- Tailwind CSS
- React Hook Form
- Zod
- Shadcn UI
- Next-Theme
- React Query
- Zustand

## 📦 Prerequisites

- Python 3.12
- Node.js (v18 or higher)
- npm or yarn

## 🚀 Installation

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Run migrations:
   ```bash
   python manage.py migrate
   ```

5. Start the backend server:
   ```bash
   python manage.py runserver
   ```

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

## 📝 API Documentation

The API documentation is available at `/api/docs` when the backend server is running.

## 🛠 Development

### Backend Development

1. Create a new view:
   ```python
   @method_decorator(csrf_exempt, name='dispatch')
   class YourView(View):
       def post(self, request):
           pass

       def update(self, request):
           pass
   ```

2. Add URL patterns in `urls.py`:
   ```python
   urlpatterns = [
       path('your-endpoint/', YourView.as_view(), name='your-endpoint'),
   ]
   ```

### Frontend Development

1. Create a new component:
   ```typescript
   import { useState } from 'react'
   import { useForm } from 'react-hook-form'
   import { zodResolver } from '@hookform/resolvers/zod'
   import * as z from 'zod'

   const YourComponent = () => {
     // Your component logic here
   }
   ```

2. Use React Query for data fetching:
   ```typescript
   import { useQuery } from '@tanstack/react-query'

   const { data, isLoading, error } = useQuery({
     queryKey: ['your-data'],
     queryFn: () => fetchYourData(),
   })
   ```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.
