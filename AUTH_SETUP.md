# Authentication System Setup

## Features Implemented

### Backend
- ✅ User authentication with JWT tokens
- ✅ Password hashing with bcryptjs
- ✅ Login and Signup endpoints
- ✅ Protected routes middleware
- ✅ CORS enabled for frontend communication

### Frontend
- ✅ Login page with form validation
- ✅ Signup page with password confirmation
- ✅ Responsive design with gradient styling
- ✅ Token-based authentication
- ✅ Persistent login (localStorage)
- ✅ User welcome page after login
- ✅ Logout functionality

## How to Run

### 1. Start the Backend Server

```bash
cd WebDevbackend
npm run dev
```

The backend will run on `http://localhost:4000`

### 2. Start the Frontend (In a new terminal)

```bash
npm run dev
```

The frontend will run on `http://localhost:5173` (or another port if 5173 is busy)

## API Endpoints

### Authentication Routes

- **POST /auth/signup**
  - Body: `{ "name": "John Doe", "email": "john@example.com", "password": "password123" }`
  - Response: `{ "token": "...", "user": {...} }`

- **POST /auth/login**
  - Body: `{ "email": "john@example.com", "password": "password123" }`
  - Response: `{ "token": "...", "user": {...} }`

- **GET /auth/me** (Protected)
  - Headers: `Authorization: Bearer <token>`
  - Response: Current user data

## Testing the Application

1. Open your browser to the frontend URL
2. You'll see the Login page
3. Click "Sign up" to create a new account
4. Fill in your name, email, and password
5. After successful signup, you'll be logged in automatically
6. You can logout and login again with your credentials

## Security Notes

- Passwords are hashed before storing in the database
- JWT tokens expire after 7 days
- Change the `JWT_SECRET` in `.env` to a strong random string in production
- Never commit the `.env` file to version control

## Tech Stack

**Backend:**
- Express.js
- MongoDB with Mongoose
- JWT for authentication
- bcryptjs for password hashing

**Frontend:**
- React
- Vite
- CSS3 with gradient styling
