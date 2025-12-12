# Frontend

## Overview

React frontend for the notes app, built with Vite, TypeScript, React Router v6, and shadcn/ui components.

## Project Structure

```
src/
├── main.tsx              # App entry, router setup, API client config
├── App.tsx               # Root layout with Outlet and Toaster
├── index.css             # Tailwind CSS + theme variables
├── theme.config.ts       # Configurable theme (colors, typography)
├── components/
│   ├── ui/               # shadcn/ui components (auto-generated)
│   ├── AuthForm.tsx      # Shared login/signup form
│   ├── Header.tsx        # App header with user info + logout
│   ├── NoteCard.tsx      # Individual note display
│   ├── NoteEditor.tsx    # Create/edit note dialog
│   ├── NoteList.tsx      # Grid layout for notes
│   └── ProtectedRoute.tsx # Auth guard for protected routes
├── hooks/
│   └── useAuth.ts        # Shared auth logic (login/signup)
├── pages/
│   ├── LoginPage.tsx     # Login form
│   ├── SignupPage.tsx    # Signup form
│   └── NotesPage.tsx     # Notes dashboard with CRUD
└── services/
    ├── api-service/      # Auto-generated API client (from OpenAPI)
    └── auth-service.ts   # JWT token management (localStorage)
```

## Architecture

The codebase follows a clear separation of concerns:

| Layer | Location | Responsibility |
|-------|----------|----------------|
| **Pages** | `pages/*` | Route components, state management, orchestration |
| **Components** | `components/*` | Reusable UI, presentation logic |
| **Hooks** | `hooks/*` | Shared stateful logic (e.g., auth flow) |
| **Services** | `services/*` | API client, token management |

### Error Handling

API errors are handled centrally via axios interceptors in `main.tsx`:
- All errors are automatically toasted to the user
- No redundant try/catch blocks in components
- Error messages are extracted from `response.data.message`

## Routes

| Path | Component | Auth | Description |
|------|-----------|------|-------------|
| `/` | — | No | Redirects to `/notes` |
| `/login` | `LoginPage` | No | User login |
| `/signup` | `SignupPage` | No | User registration |
| `/notes` | `NotesPage` | Yes | Notes dashboard |

## Components

### UI Components (shadcn/ui)

| Component | Usage |
|-----------|-------|
| `Button` | Primary actions, form submissions |
| `Card` | Note cards, auth form container |
| `Dialog` | Note create/edit modal |
| `Input` | Form text inputs |
| `Label` | Form field labels |
| `Textarea` | Note content input |

### Custom Components

| Component | Description |
|-----------|-------------|
| `AuthForm` | Shared form for login/signup with mode toggle |
| `Header` | App bar with logo, user email, sign out button |
| `NoteCard` | Displays note title, content preview, edit/delete actions |
| `NoteEditor` | Dialog for creating and editing notes |
| `NoteList` | Responsive grid of NoteCards |
| `ProtectedRoute` | Redirects to `/login` if not authenticated |

## Theme Customization

Edit `src/theme.config.ts` to customize the app's appearance:

```typescript
export const themeConfig = {
  light: {
    background: "0 0% 100%",
    primary: "240 5.9% 10%",
    // ... more colors
  },
  dark: {
    background: "240 10% 3.9%",
    primary: "0 0% 98%",
    // ... more colors
  },
  typography: {
    fontFamily: "'Geist', system-ui, sans-serif",
  },
  radius: "0.5rem",
};
```

Colors use HSL format for compatibility with shadcn/ui.

## Getting Started

1. Ensure [Bun](https://bun.sh) is installed
2. Run `bun install`
3. Ensure the backend is running (for API client generation)
4. Run `bun run dev`

## Scripts

| Command | Description |
|---------|-------------|
| `bun run dev` | Generate API client and start dev server |
| `bun run build` | Generate API client and build for production |
| `bun run generate` | Regenerate API client from backend OpenAPI spec |
| `bun run lint` | Run ESLint |

## Key Features

- **Auto-generated API Client**: Uses `@hey-api/openapi-ts` to generate typed services from backend Swagger
- **Centralized Error Handling**: All API errors are automatically toasted
- **JWT Authentication**: Tokens stored in localStorage, sent via axios interceptor
- **Protected Routes**: Automatic redirect to login for unauthenticated users
- **shadcn/ui Components**: Modern, accessible UI components
- **Configurable Theme**: Easy customization via `theme.config.ts`
