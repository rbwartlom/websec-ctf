# Backend

## Overview

This is an Express.js backend running on Bun with TypeScript. 

### Project Structure
```
src/
├── index.ts        # Server setup, middleware, and router registration
├── config.ts       # Environment validation and utility functions
├── auth.ts         # Authentication helpers
├── swagger.ts      # OpenAPI/Swagger documentation generator
├── types.ts        # Shared TypeScript types
└── routers/        # Route handlers (add new routers here)
    └── ...
```

### Key Features
- **Swagger UI**: API documentation available at `/api/docs`
- **Static Frontend**: Serves built frontend from `dist/frontend`
- **Error Handling**: Uses `SafeError` for client-safe errors, catches unhandled errors

## Getting started
- Ensure you have [bun](https://bun.sh) installed on your machine.
- Run `bun install` from this directory.
- Create a `.env` file with the below environment variables.
- Run `bun run dev` to start the server.

## Environment variables
- (optional) `PORT`: The port to run the server on.
- (only in production) `BASE_URL`: The base URL of the server.
