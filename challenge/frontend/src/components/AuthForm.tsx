import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface AuthFormProps {
  mode: "login" | "signup";
  onSubmit: (email: string, password: string) => Promise<void>;
  isLoading?: boolean;
}

export function AuthForm({ mode, onSubmit, isLoading = false }: AuthFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(email, password);
  };

  const isLogin = mode === "login";
  const title = isLogin ? "Welcome back" : "Create an account";
  const description = isLogin
    ? "Enter your credentials to access your notes"
    : "Enter your email and password to get started";
  const buttonText = isLogin ? "Sign in" : "Sign up";
  const alternateText = isLogin
    ? "Don't have an account?"
    : "Already have an account?";
  const alternateLinkText = isLogin ? "Sign up" : "Sign in";
  const alternateLink = isLogin ? "/signup" : "/login";

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                autoComplete={isLogin ? "current-password" : "new-password"}
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Loading..." : buttonText}
            </Button>
            <p className="text-sm text-muted-foreground text-center">
              {alternateText}{" "}
              <Link
                to={alternateLink}
                className="text-primary underline-offset-4 hover:underline"
              >
                {alternateLinkText}
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}

