# PractiKcal

PractiKcal is a responsive web application for nutrition tracking, developed as part of the French Web and Mobile Web Developer professional certification (DWWM).

## Tech Stack

- Frontend: React, Vite, Tailwind CSS
- Backend: Node.js, Express
- Database: PostgreSQL
- External food data: Open Food Facts
- Development environment: Docker Compose

## Project Structure

PractiKcal uses a monorepo structure:

- `frontend/`: React application
- `backend/`: Node.js and Express API
- `database/`: PostgreSQL migrations and database initialization
- `docs/`: project documentation

## Development Setup

The development environment uses Docker Compose to run the frontend, backend and PostgreSQL services.

Environment variables are defined locally and are not committed to the repository. Example configuration files are provided when needed.

## Authentication

Authentication is based on persistent server-side sessions.

- Passwords are hashed with Argon2id.
- Sessions are managed with `express-session`.
- Session data is persisted in PostgreSQL using `connect-pg-simple`.
- Authentication cookies use appropriate security attributes.

## Status

Currently in development — Sprint 1.
