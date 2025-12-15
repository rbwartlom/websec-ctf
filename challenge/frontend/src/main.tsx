import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider, Navigate } from "react-router-dom";
import toast from "react-hot-toast";
import "./index.css";
import App from "./App";
import { LoginPage } from "./pages/LoginPage";
import { SignupPage } from "./pages/SignupPage";
import { NotesPage } from "./pages/NotesPage";
import { PublicNotesPage } from "./pages/PublicNotesPage";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { client } from "./services/api-service";
import { getAuthHeader } from "./services/auth-service";

// Configure the API client
client.setConfig({
  baseURL: "http://localhost:3000",
});

// Add auth header to all requests
client.instance.interceptors.request.use((config) => {
  const header = getAuthHeader();
  if (header !== null) {
    config.headers.set("Authorization", header);
  }
  return config;
});

// Centralized error handling - toast all API errors
client.instance.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    // Extract error message from response or use fallback
    let message = "An error occurred";

    if (error !== null && typeof error === "object") {
      const err = error as Record<string, unknown>;
      
      // Check for axios response error structure
      if (err.response && typeof err.response === "object") {
        const response = err.response as Record<string, unknown>;
        if (response.data && typeof response.data === "object") {
          const data = response.data as Record<string, unknown>;
          if (typeof data.message === "string") {
            message = data.message;
          }
        }
      } else if (typeof err.message === "string") {
        message = err.message;
      }
    }

    toast.error(message);
    return Promise.reject(error);
  }
);

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      { index: true, element: <Navigate to="/notes" replace /> },
      { path: "login", element: <LoginPage /> },
      { path: "signup", element: <SignupPage /> },
      { path: "public", element: <PublicNotesPage /> },
      {
        path: "notes",
        element: (
          <ProtectedRoute>
            <NotesPage />
          </ProtectedRoute>
        ),
      },
    ],
  },
]);

const rootElement = document.getElementById("root");
if (rootElement) {
  createRoot(rootElement).render(
    <StrictMode>
      <RouterProvider router={router} />
    </StrictMode>
  );
}
