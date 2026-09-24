# PractiKcal

PractiKcal is a responsive web application for nutrition tracking, developed as part of the French Web and Mobile Web Developer professional certification (DWWM).

## Tech Stack

- Frontend: React, Vite, Tailwind CSS, React Router
- Backend: Node.js, Express
- Database: PostgreSQL
- Authentication: Argon2id, express-session, connect-pg-simple
- External food data: Open Food Facts
- Development environment: Docker Compose

## Project Structure

PractiKcal uses a monorepo structure:

- `frontend/`: React application
- `backend/`: Node.js and Express API
- `database/`: PostgreSQL migrations and database initialization
- `docs/`: project documentation

## Frontend

The frontend is built with React and Vite.

The current interface foundation includes:

- Tailwind CSS for utility-based styling
- React Router for application routing
- A shared authenticated application layout
- Reusable form and interface components
- Mobile-first responsive foundations
- Keyboard focus and basic accessibility considerations
- A persistent bottom navigation for the main authenticated views
- Dedicated loading, success and error states where required

The main navigation currently provides access to:

- Journal
- Actions
- Profile

The nutrition goals screen is handled as a secondary view and does not display the main bottom navigation.

## Authentication and Sessions

Authentication is based on persistent server-side sessions.

- Passwords are hashed with Argon2id.
- Sessions are managed with `express-session`.
- Session data is persisted in PostgreSQL using `connect-pg-simple`.
- Session cookies use `HttpOnly`, `SameSite` and production-appropriate `Secure` settings.
- `GET /auth/me` restores the authenticated user when the application loads.
- `POST /auth/logout` invalidates the current session.
- Protected backend resources derive the user identity from the session rather than from a `user_id` supplied by the frontend.
- Protected frontend routes redirect unauthenticated users to the login screen.

After authentication, the application checks whether the user already has nutrition goals:

- users without nutrition goals are redirected to the goals setup screen;
- users with existing goals are directed to the main application view.

## Nutrition Goals

Authenticated users can define and update their nutrition goals:

- daily calorie target
- protein percentage
- carbohydrate percentage
- fat percentage
- daily fiber target

The interface provides default and custom macronutrient distributions and displays the equivalent macronutrient quantities in grams.

## Development Setup

The development environment uses Docker Compose for the application services and PostgreSQL.

Environment variables are defined locally and are not committed to the repository. Example configuration files are provided when needed.

The frontend production build can be verified from the `frontend/` directory:

```bash
npm run build
```

## Code Style

Frontend JavaScript, JSX, CSS, JSON and HTML files use two-space indentation.

Project formatting rules are defined in .editorconfig.

## Status

Currently in development — Sprint 1.

Implemented foundations include authentication, persistent sessions, protected routes, nutrition goals management and the initial reusable frontend interface architecture.
