# TruthLens AI

TruthLens AI is a production-oriented **Multimodal Digital Trust & Forensics Platform** for analyzing suspicious digital content such as AI-generated images, deepfake videos, scam messages, phishing URLs, manipulated media, misinformation, and social media content.

This repository currently contains the completed foundation through **Milestone 2**. AI modules are intentionally not implemented yet.

## Current Scope

- React + Vite frontend
- Tailwind CSS setup
- FastAPI backend
- MongoDB Atlas connection configuration
- Basic health-check API
- Basic landing page
- Login, signup, forgot password, reset password, and profile pages
- JWT access tokens and refresh-token rotation
- Argon2 password hashing
- Email verification token flow
- Password reset token flow
- Protected frontend routes
- User/Admin RBAC dependencies
- MongoDB `users` collection with indexes
- Authenticated image upload endpoint
- Local image storage with MongoDB upload metadata
- Dockerfiles
- Docker Compose
- GitHub Actions CI workflow
- Professional project structure
- Environment variable template

## Architecture

```text
truthlens-ai/
  apps/
    web/      React + Vite frontend
    api/      FastAPI backend
  docs/       Architecture and planning notes
  .github/    CI workflows
```

## Tech Stack

Frontend:

- React
- Vite
- TypeScript
- Tailwind CSS
- Lucide React

Backend:

- FastAPI
- Motor async MongoDB driver
- Pydantic Settings
- Uvicorn
- Argon2 password hashing
- PyJWT

Infrastructure:

- Docker
- Docker Compose
- MongoDB Atlas
- GitHub Actions

## Getting Started

### 1. Create environment file

Copy `.env.example` to `.env` and update the MongoDB Atlas connection string.

```bash
cp .env.example .env
```

Required values:

```text
MONGODB_URI
MONGODB_DATABASE
API_CORS_ORIGINS
VITE_API_BASE_URL
JWT_ACCESS_SECRET
JWT_REFRESH_SECRET
```

### 2. Run with Docker Compose

```bash
docker compose up --build
```

Services:

- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:8000`
- API health check: `http://localhost:8000/api/v1/health`

### 3. Run locally without Docker

Frontend:

```bash
npm install
npm run dev:web
```

Backend:

```bash
cd apps/api
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

On Windows PowerShell:

```powershell
cd apps/api
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn app.main:app --reload
```

## API

Current API:

```text
GET /api/v1/health
POST /api/v1/auth/signup
POST /api/v1/auth/login
POST /api/v1/auth/refresh
POST /api/v1/auth/logout
POST /api/v1/auth/verify-email
POST /api/v1/auth/forgot-password
POST /api/v1/auth/reset-password
GET /api/v1/auth/me
GET /api/v1/users/me
PATCH /api/v1/users/me
GET /api/v1/users
POST /api/v1/uploads/image
```

Image upload accepts `JPG`, `JPEG`, `PNG`, and `WEBP` files up to 20 MB. Uploaded files are stored in `storage/uploads`, and metadata is saved in MongoDB.

Example response:

```json
{
  "status": "ok",
  "service": "TruthLens AI",
  "environment": "development",
  "database": "connected"
}
```

If MongoDB is unavailable, the API remains reachable and reports a degraded health state.

## Development Roadmap

Milestone 1: Project setup and platform foundation. Complete.

Milestone 2: Authentication and user accounts. Complete.

Milestone 3 Part 1: Image upload module. Complete.

Milestone 3 Part 2: Dashboard.

Milestone 4: Image analysis workflow.

Milestone 5: Scam detection workflow.

Milestone 6: Digital evidence analyzer.

Milestone 7: Social media analyzer.

Milestone 8: Report generator.

Milestone 9: Deployment hardening.

Milestone 10: Testing and documentation.

## Security Notes

Do not commit `.env` files or secrets. Use MongoDB Atlas credentials through environment variables only.

## License

MIT
