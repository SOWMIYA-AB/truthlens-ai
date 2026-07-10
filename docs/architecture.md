# TruthLens AI Architecture

TruthLens AI is structured as a modular full-stack platform with a React + Vite frontend, a FastAPI backend, MongoDB Atlas for persistence, and Docker-based local and production workflows.

Milestone 2 includes authentication, protected routes, refresh-token sessions, email verification, password reset, and RBAC foundations. AI inference is intentionally not included yet.

## Runtime Components

- `apps/web`: React + Vite frontend.
- `apps/api`: FastAPI backend.
- `apps/api/app/modules/auth`: JWT authentication, refresh tokens, email verification, password reset.
- `apps/api/app/modules/users`: profile and RBAC-protected user routes.
- `apps/api/app/modules`: future domain modules.
- MongoDB Atlas: primary database.
- Docker Compose: local orchestration for web and API services.

## Future Extension Points

- Upload and storage module.
- Analysis orchestration module.
- AI service integration.
- Reports module.
- Admin and audit modules.
