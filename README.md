# Mechanics Activity Report - Frontend

A modern, mobile-responsive Next.js 14 frontend application for the Mechanics Activity Report system.

## Features

- 🎨 **Mobile-First Design**: Fully responsive and optimized for phone devices
- 🔐 **Authentication**: Secure login and user management
- 👷 **Mechanics Dashboard**: Work time tracking and activity management
- 📋 **Planner Dashboard**: Activity creation and assignment
- 📱 **Touch-Friendly**: Optimized for mobile interactions
- ⚡ **Fast & Modern**: Built with Next.js 14 and TypeScript

## Tech Stack

- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **Axios** - HTTP client for API requests
- **js-cookie** - Cookie management

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Backend API running (see `mar-be` directory)

### Installation

1. Install dependencies:
```bash
npm install
```

2. Create environment file:
```bash
# Create .env.local file in the mar-fe directory with:
NEXT_PUBLIC_API_URL=http://localhost:8000
```

   Note: The default backend port is 8000. Adjust if your backend runs on a different port.

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

```
mar-fe/
├── app/                    # Next.js App Router pages
│   ├── login/             # Login page
│   ├── dashboard/         # Main dashboard
│   ├── profile/           # User profile settings
│   ├── mechanics/         # Mechanics-specific pages
│   │   ├── work-times/    # Work time tracking
│   │   └── activities/    # Activity management
│   └── planner/           # Planner-specific pages
│       └── activities/    # Activity creation
├── components/            # Reusable React components
│   ├── Navbar.tsx        # Navigation bar
│   └── ProtectedRoute.tsx # Route protection
├── lib/                   # Utility functions
│   ├── api.ts            # API client
│   └── auth.ts           # Authentication helpers
└── public/               # Static assets
```

## User Roles & Permissions

### Mechanics (MEKANIK)
- View and create work times
- View assigned activities
- Start, pause, resume, and stop activities

### Planners (PLANNER)
- Create and manage activities
- Assign activities to mechanics
- View all activities

### Admins (ADMIN/SUPERADMIN)
- Full access to all features
- User management
- System configuration

## Mobile Optimization

The application is fully optimized for mobile devices:

- **Responsive Layout**: Adapts to all screen sizes
- **Touch Targets**: Minimum 44x44px for easy tapping
- **Mobile Navigation**: Hamburger menu for small screens
- **Form Optimization**: Prevents iOS zoom on input focus
- **Fast Loading**: Optimized assets and code splitting

## API Integration

The frontend communicates with the backend API. Make sure:

1. Backend is running on the port specified in `NEXT_PUBLIC_API_URL`
2. API endpoints match the routes defined in `lib/api.ts`
3. CORS is properly configured on the backend

## Building for Production

```bash
npm run build
npm start
```

## Environment Variables

- `NEXT_PUBLIC_API_URL` - Backend API URL (default: http://localhost:8000)

## Development Tips

- Use the mobile view in browser DevTools to test mobile experience
- Check the Network tab to debug API calls
- Use React DevTools for component debugging

## License

ISC
