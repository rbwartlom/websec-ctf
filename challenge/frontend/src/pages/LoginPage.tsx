import { AuthForm } from "../components/AuthForm";
import { useAuth } from "../hooks/useAuth";

export function LoginPage() {
  const { authenticate, isLoading } = useAuth("login");

  return <AuthForm mode="login" onSubmit={authenticate} isLoading={isLoading} />;
}
