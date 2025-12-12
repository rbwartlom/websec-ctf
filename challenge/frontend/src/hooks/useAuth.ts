import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { postApiUsersLogin, postApiUsersSignup } from "../services/api-service";
import { setAuthKey } from "../services/auth-service";

type AuthMode = "login" | "signup";

export function useAuth(mode: AuthMode) {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const authenticate = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const apiCall = mode === "login" ? postApiUsersLogin : postApiUsersSignup;
      const response = await apiCall({ body: { email, password } });

      if (response.data?.token) {
        setAuthKey(response.data.token);
        navigate("/notes", { replace: true });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return { authenticate, isLoading };
}

