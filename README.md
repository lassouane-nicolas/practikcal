# PractiKcal

PractiKcal is a responsive web application for nutrition tracking, developed as part of the French Web and Mobile Web Developer professional certification (DWWM).

## Tech Stack

- Frontend: React, Vite, Tailwind CSS, React Router
- Backend: Node.js, Express
- Database: PostgreSQL
- Authentication: Argon2id, express-session, connect-pg-simple
- External food data: Open Food Facts / Search-a-licious
- Development environment: local Node.js/Vite development with PostgreSQL via Docker Compose

## Project Structure

PractiKcal uses a monorepo structure:

- `frontend/`: React application
- `backend/`: Node.js and Express API, including routes, middleware, services and database access
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

## Food Catalog

The backend provides a unified food catalog combining local application data and external food sources.

The current food model supports three origins:

- `USER`: personal foods created by an authenticated user
- `OFF`: commercial products imported from Open Food Facts
- `CIQUAL`: reserved for generic reference foods

Personal foods are isolated by user. Open Food Facts and CIQUAL foods are global application data.

The food catalog supports:

- food search
- food detail retrieval
- creation of personal foods
- update and deletion of personal foods
- validation of reference units (`g` or `ml`)
- nullable nutritional values when data is unknown

The database also includes food portions and journal entries for direct food consumption tracking.

## Food Journal

Authenticated users can manage direct food consumption entries for a given day.

The backend currently supports:

- `POST /journal` to add a food consumption entry
- `GET /journal?date=YYYY-MM-DD` to retrieve entries for a specific day
- `PUT /journal/:id` to update an existing entry
- `DELETE /journal/:id` to remove an entry

Journal entries support two quantity modes:

- `REFERENCE`: the entered quantity is already expressed in the food reference unit (`g` or `ml`)
- `PORTION`: the entered quantity is converted using a predefined food portion

When an entry is created or updated, PractiKcal stores:

- the effective reference quantity consumed
- calories
- protein
- carbohydrates
- fat
- fiber

These values are stored as snapshots so that historical journal entries remain stable even if the related food or portion is modified later.

Unknown nutritional values remain `null` and are not converted to `0`.

Journal access is restricted to the authenticated user through the current server-side session.

## Open Food Facts Integration

Commercial food products are retrieved from Open Food Facts through the backend.

Text search uses Search-a-licious and returns a limited, normalized set of fields required by PractiKcal.

Search results are treated as partial external data and are not persisted immediately.

When a user selects an Open Food Facts product:

1. the backend retrieves the latest product data through the Open Food Facts product API;
2. the product is normalized into the internal food model;
3. the nutritional reference unit is derived from `nutrition_data_per`;
4. the product is inserted into PostgreSQL if it does not already exist;
5. an existing product is updated with the latest available Open Food Facts data.

Missing nutritional values remain `null` and are never converted to `0`.

If kcal values are unavailable but kJ values are present, PractiKcal converts the energy value to kcal.

Open Food Facts errors are handled explicitly, including:

- invalid barcode
- product not found
- incomplete product data
- unavailable external service

The product barcode is used as the external product reference.

Future optimization: Open Food Facts revision metadata may be stored to avoid unnecessary database updates when a remote product has not changed.

## Backend Tests

Backend integration tests use Vitest and Supertest with a dedicated PostgreSQL test database.

From the `backend/` directory:

```bash
npm test
```

Run the full test suite once without watch mode:

```bash
npm test -- --run
```

## Development Setup

PractiKcal can be run with Docker Compose, but the current development workflow runs the frontend and backend locally while PostgreSQL remains containerized.

Typical local development setup:

- PostgreSQL runs in Docker Compose
- Backend runs locally with Node.js watch mode
- Frontend runs locally with Vite

From the `backend/` directory:

```bash
npm run dev
```

From the frontend/ directory:

```bash
npm run dev
```

Environment variables are defined locally and are not committed to the repository.

## Code Style

Frontend JavaScript, JSX, CSS, JSON and HTML files use two-space indentation.

Project formatting rules are defined in .editorconfig.

## Status

Currently in development — Sprint 2: Foods & Journal.

Implemented foundations include:

- authentication and persistent sessions
- protected frontend and backend routes
- nutrition goals management
- reusable responsive interface foundations
- food database schema
- local food catalog
- personal food CRUD
- Open Food Facts text search
- Open Food Facts product normalization and synchronization
- food portions
- food journal backend CRUD
- nutritional snapshots for journal entries
- reference and portion-based quantity handling

Current Sprint 2 work focuses on connecting the food search/add flow to the frontend and extending backend test coverage.

## Data Sources and Licenses

PractiKcal uses external food composition data from:

- **Open Food Facts** — database available under the Open Database License (ODbL). Individual database contents are covered by the Database Contents License. Product images, when used, are available under the Creative Commons Attribution-ShareAlike license.
- **Ciqual / Anses** — data from the French food composition table, reused under the Licence Ouverte. Source: *Anses. 2025. Table de composition nutritionnelle des aliments Ciqual*.

PractiKcal normalizes these external data sources into its own internal data model. External data may be incomplete or evolve over time.

## Author

**Nicolas Lassouane**  
Web developer in professional retraining, currently preparing the French DWWM professional certification.

PractiKcal is developed as a portfolio and certification project focused on full-stack web development, API integration, PostgreSQL data modeling and responsive frontend development.

GitHub: [lassouane-nicolas](https://github.com/lassouane-nicolas)
