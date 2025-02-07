# TypeScript Magic Link Authentication Platform

A robust authentication platform built with TypeScript and React, focusing on secure magic link authentication and session management.

## Features

- 🔐 Secure magic link authentication
- 📧 Email-based verification
- 🔄 Intelligent session handling
- 🎨 Responsive UI with shadcn/ui components
- 🛡️ Error-resilient design
- 📱 Mobile-friendly interface

## Tech Stack

- **Frontend:**
  - React with TypeScript
  - TanStack Query for state management
  - shadcn/ui components
  - Tailwind CSS for styling
  - Wouter for routing

- **Backend:**
  - Express.js
  - PostgreSQL with Drizzle ORM
  - Nodemailer for email delivery
  - Session-based authentication

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- PostgreSQL database
- SMTP server credentials for email delivery

### Environment Variables

Create a `.env` file with the following variables:

```env
# Database
DATABASE_URL=postgresql://user:password@host:port/dbname

# Email Configuration
SMTP_USER=your-email@example.com
SMTP_PASS=your-smtp-password

# Optional: Production Configuration
NODE_ENV=development # or production
```

### Installation

1. Install dependencies:
   ```bash
   npm install
   ```

2. Push database schema:
   ```bash
   npm run db:push
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

The application will be available at `http://localhost:5000`

## Testing

The project includes comprehensive test coverage using Vitest and Testing Library:

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage
```

### Test Structure

- `client/src/setupTests.ts` - Test setup and configuration
- `client/src/hooks/__tests__/` - Hook tests
- `client/src/pages/__tests__/` - Component tests
- `server/__tests__/` - Backend API tests

## Project Structure

```
├── client/                  # Frontend code
│   ├── src/
│   │   ├── components/     # UI components
│   │   ├── hooks/         # Custom React hooks
│   │   ├── lib/          # Utility functions
│   │   └── pages/        # Route components
├── server/                 # Backend code
│   ├── routes.ts          # API routes
│   ├── email.ts          # Email service
│   └── db.ts            # Database configuration
└── shared/               # Shared TypeScript types
```

## Authentication Flow

1. User enters email on login page
2. Backend generates a secure magic link
3. Link is sent to user's email
4. User clicks link to verify identity
5. Session is established and user is redirected
6. Subsequent requests include session cookie

## Development Guidelines

- Follow the TypeScript type system strictly
- Write tests for new features
- Use shadcn/ui components for consistent UI
- Keep the frontend and backend types in sync
- Follow the error handling patterns established

## License

This project is licensed under the MIT License - see the LICENSE file for details.
