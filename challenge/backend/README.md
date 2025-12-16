# Backend

## Overview

Express.js backend with JWT authentication and note management, running on Bun with TypeScript and MongoDB.

## Project Structure

```
src/
├── index.ts           # Server setup and router registration
├── config.ts          # Environment validation, SafeError, async handler
├── auth.ts            # JWT authentication middleware
├── swagger.ts         # OpenAPI/Swagger documentation
├── types.ts           # Express request augmentation
├── models/
│   ├── schema.ts      # Schema factory with custom string IDs
│   ├── User.ts        # User model + type guard
│   └── Note.ts        # Note model + type guard
├── controllers/
│   ├── user.ts        # User business logic (signup, login, getMe)
│   └── note.ts        # Note CRUD business logic
├── routers/
│   ├── users.ts       # /api/users routes
│   └── notes.ts       # /api/notes routes
└── utils/
    ├── guards.ts      # Shared type guards
    ├── input.ts       # Input validation types + guards
    ├── jwt.ts         # JWT sign/verify
    └── password.ts    # Password hash/verify (scrypt)
```

## Architecture

The codebase follows a layered architecture:

| Layer | Location | Responsibility |
|-------|----------|----------------|
| **Routers** | `routers/*` | HTTP only: validate input shape, call controllers, set response |
| **Controllers** | `controllers/*` | Business logic, DB operations, throw `SafeError` for expected failures |
| **Utils** | `utils/*` | Pure helpers with no DB or Express dependencies |

## API Endpoints

### Authentication

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/users/signup` | No | Register new user |
| POST | `/api/users/login` | No | Login, returns JWT |
| GET | `/api/users/me` | Yes | Get current user profile |

### Notes

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/notes` | Yes | Create note |
| GET | `/api/notes` | Yes | List user's notes |
| GET | `/api/notes/:id` | Yes | Get single note |
| PUT | `/api/notes/:id` | Yes | Update note |
| DELETE | `/api/notes/:id` | Yes | Delete note |

## Getting Started

(Ensure you are in the backend directory)
1. Ensure [Bun](https://bun.sh) is installed
2. Run `bun install`
3. Create a `.env` file (see below)
4. Start MongoDB
5. Run `bun run dev`

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `MONGODB_URI` | Yes | MongoDB connection string |
| `JWT_SECRET` | Yes | Secret key for JWT signing |
| `PORT` | No | Server port (default: 3000) |
| `BASE_URL` | Production | Public URL for Swagger docs |

Example `.env`:
```
MONGODB_URI=mongodb://localhost:27017/notes
JWT_SECRET=your-secret-key-here
```

## Key Features

- **Swagger UI**: Interactive API docs at `/api/docs`
- **JWT Authentication**: Stateless auth via Bearer tokens
- **Custom String IDs**: UUIDs instead of MongoDB ObjectIds
- **Type Guards**: Runtime validation without type casts
- **Static Frontend**: Serves built frontend from `dist/frontend`
