# Commute Buddy Frontend

A modern React frontend for the Commute Buddy traffic management application, featuring user verification and admin management systems.

## 🚀 Features Implemented

### Pages Created
1. **Verification Center** (`/verification`)
   - Document upload with drag-and-drop
   - Verification status tracking
   - File preview and management
   - Modern UI with progress indicators

2. **Admin Dashboard** (`/admin`)
   - Pending verifications overview
   - Quick approval/rejection actions
   - Statistics and metrics
   - Real-time data updates

3. **User Management** (`/admin/users`)
   - Role assignment interface
   - User search and filtering
   - Bulk actions for user management
   - Permission-based access control

4. **Verification Review** (`/admin/verification/:userId`)
   - Detailed document review interface
   - Image viewer with zoom/rotation
   - Approval/rejection workflow
   - Admin feedback system

## 🛠 Technology Stack

- **React 18** - Modern functional components with hooks
- **React Router** - Client-side routing with protected routes
- **Tailwind CSS** - Utility-first CSS framework with custom design system
- **Lucide React** - Beautiful, customizable icons
- **Axios** - HTTP client with interceptors for API calls
- **React Hook Form** - Efficient form handling (ready to integrate)

## 🎨 Design Features

- **Modern Typography** - Inter and Poppins fonts
- **Custom Color Palette** - Primary, success, warning, and danger colors
- **Responsive Design** - Mobile-first approach with Tailwind
- **Smooth Animations** - CSS transitions and custom keyframes
- **Toast Notifications** - User feedback system
- **Loading States** - Skeleton loaders and spinners
- **Dark/Light Theme Ready** - CSS custom properties

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── LoadingSpinner.js
│   ├── Toast.js
│   ├── Navbar.js
│   └── ProtectedRoute.js
├── context/            # React Context for state management
│   └── AuthContext.js
├── pages/              # Main application pages
│   ├── Login.js
│   ├── Dashboard.js
│   ├── VerificationCenter.js
│   ├── AdminDashboard.js
│   ├── UserManagement.js
│   └── VerificationReview.js
├── services/           # API service layer
│   └── api.js
└── hooks/              # Custom React hooks
```

## 🔧 Setup Instructions

### Prerequisites
- Node.js 16+ and npm
- Backend server running on port 4321

### Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment:**
   ```bash
   # .env file already configured for local development
   REACT_APP_API_URL=http://localhost:4321/api
   ```

3. **Start development server:**
   ```bash
   npm start
   ```

4. **Build for production:**
   ```bash
   npm run build
   ```

## 🔐 Authentication & Authorization

- **JWT Token Management** - Automatic token refresh and storage
- **Role-Based Access Control** - Admin, Moderator, Verified Reporter, User roles
- **Protected Routes** - Automatic redirects based on authentication state
- **Permission Checks** - Component-level access control

## 📱 Responsive Design

- **Mobile-first** - Optimized for all screen sizes
- **Touch-friendly** - Large tap targets and gestures
- **Progressive Enhancement** - Works without JavaScript for core features

## 🔌 API Integration

The frontend integrates with your existing backend endpoints:

### User Routes
- `POST /api/users/login` - User authentication
- `POST /api/users/register` - User registration
- `GET /api/users/:id` - Get user profile
- `PUT /api/users/:id` - Update profile
- `POST /api/users/:id/verify` - Submit verification documents

### Admin Routes
- `GET /api/admin/pending-verifications` - List pending verifications
- `GET /api/admin/verification/:userId` - Get verification details
- `PUT /api/admin/verification/:userId/approve` - Approve verification
- `PUT /api/admin/verification/:userId/reject` - Reject verification
- `PUT /api/admin/users/:userId/role` - Update user role

## 🎯 Demo Credentials

For testing purposes:
- **Admin:** admin@example.com / password
- **User:** user@example.com / password

## 🚧 Next Steps

To continue development:

1. **Connect to real file storage** (AWS S3, Cloudinary)
2. **Add image compression** for uploaded documents
3. **Implement real-time notifications** (WebSocket/SSE)
4. **Add audit logging** for admin actions
5. **Enhance accessibility** (ARIA labels, keyboard navigation)
6. **Add tests** (Jest, React Testing Library)

## 📄 Notes

- All components use modern React patterns (hooks, functional components)
- Tailwind classes are organized for maintainability
- API service layer abstracts backend communication
- Error handling includes user-friendly messages
- Loading states provide smooth user experience
- Mobile responsiveness tested on multiple devices

Built with ❤️ for Commute Buddy Module 1 requirements.
