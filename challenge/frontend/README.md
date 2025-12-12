# Frontend

## Overview

This is a React frontend built with Vite and TypeScript.

### Project Structure
```
src/
├── main.tsx          # App entry point
├── App.tsx           # Root component
├── index.css         # Global styles
├── build-script.ts   # API client generation script
├── components/       # Reusable UI components
├── pages/            # Page components
│   └── Home.ts
└── services/         # API and auth services
    ├── api-service/  # Auto-generated API client (from OpenAPI)
    └── auth-service.ts
```

### Key Features
- **Vite**: Fast development server with HMR
- **Auto-generated API Client**: Uses `@hey-api/openapi-ts` to generate typed API services from backend Swagger
- **React Hot Toast**: Toast notifications for user feedback

## Getting started
- Ensure you have [bun](https://bun.sh) installed on your machine.
- Run `bun install` from this directory.
- Run `bun run dev` to start the development server.

## Scripts
- `bun run dev`: Generate API client and start dev server
- `bun run build`: Generate API client and build for production
- `bun run generate`: Regenerate API client from backend OpenAPI spec
- `bun run lint`: Run ESLint

