import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { clearAuth } from "../services/auth-service";

interface HeaderProps {
  userEmail?: string;
}

export function Header({ userEmail }: HeaderProps) {
  const navigate = useNavigate();

  const handleLogout = () => {
    clearAuth();
    navigate("/login", { replace: true });
  };

  return (
    <header className="border-b border-border bg-card">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-bold">Notes</h1>
          {userEmail && (
            <span className="text-sm text-muted-foreground hidden sm:inline">
              {userEmail}
            </span>
          )}
        </div>
        <Button variant="outline" size="sm" onClick={handleLogout}>
          Sign out
        </Button>
      </div>
    </header>
  );
}

