import { AuthForm } from "../components/AuthForm";
import { useAuth } from "../hooks/useAuth";

export function SignupPage() {
  const { authenticate, isLoading } = useAuth("signup");

  return <AuthForm mode="signup" onSubmit={authenticate} isLoading={isLoading} />;
}
