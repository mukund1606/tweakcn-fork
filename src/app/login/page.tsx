"use client";

import { useSearchParams } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";

const isProduction = process.env.NODE_ENV === "production";

export default function LoginPage() {
  const searchParams = useSearchParams();
  const [isSignIn, setIsSignIn] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Form state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const getCallbackUrl = () => {
    return searchParams.get("callbackUrl") || "/editor/theme";
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const result = await authClient.signUp.email({
        name: name.trim(),
        email: email.trim(),
        password: password,
        callbackURL: getCallbackUrl(),
      });
      if (result.error) {
        throw new Error(result.error.message || "Sign up failed");
      }
      window.location.href = getCallbackUrl();
    } catch (err) {
      console.error("Sign Up Error:", err);
      setError(
        err instanceof Error ? err.message : "Failed to sign up. Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const result = await authClient.signIn.email({
        email: email.trim(),
        password: password,
        callbackURL: getCallbackUrl(),
      });
      if (result.error) {
        throw new Error(result.error.message || "Sign in failed");
      }
      window.location.href = getCallbackUrl();
    } catch (err) {
      console.error("Sign In Error:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Invalid email or password. Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMode = () => {
    setIsSignIn(!isSignIn);
    setError("");
    setPassword("");
  };

  return (
    <div className="from-background via-background to-muted/20 flex min-h-screen items-center justify-center bg-gradient-to-br p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold tracking-tight">tweakcn</h1>
          <p className="text-muted-foreground mt-2">Theme customization made easy</p>
        </div>

        <Card className="border-border/50 shadow-lg">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-2xl font-bold">
              {isSignIn ? "Welcome back" : "Create account"}
            </CardTitle>
            <CardDescription>
              {isSignIn
                ? "Sign in to your account to continue"
                : "Sign up to get started with tweakcn"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={isSignIn ? handleSignIn : handleSignUp} className="space-y-4">
              {!isSignIn && (
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="Enter your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required={!isSignIn}
                    disabled={isLoading}
                    autoComplete="name"
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                  autoComplete="email"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                </div>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                  autoComplete={isSignIn ? "current-password" : "new-password"}
                  minLength={6}
                />
              </div>

              {error && (
                <div className="bg-destructive/10 border-destructive/50 text-destructive rounded-md border p-3 text-sm">
                  {error}
                </div>
              )}

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <svg
                      className="mr-2 size-4 animate-spin"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    {isSignIn ? "Signing in..." : "Creating account..."}
                  </>
                ) : isSignIn ? (
                  "Sign in"
                ) : (
                  "Create account"
                )}
              </Button>

              {!isProduction && (
                <>
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-card text-muted-foreground px-2">
                        {isSignIn ? "New to tweakcn?" : "Already have an account?"}
                      </span>
                    </div>
                  </div>

                  <div className="text-center">
                    <button
                      type="button"
                      onClick={toggleMode}
                      disabled={isLoading}
                      className={cn(
                        "text-primary hover:text-primary/80 focus:ring-primary text-sm font-medium transition-colors hover:underline focus:ring-2 focus:ring-offset-2 focus:outline-none disabled:pointer-events-none disabled:opacity-50",
                      )}
                    >
                      {isSignIn ? "Create an account" : "Sign in to your account"}
                    </button>
                  </div>
                </>
              )}
            </form>
          </CardContent>
        </Card>

        <div className="text-muted-foreground mt-6 text-center text-xs">
          By continuing, you agree to our{" "}
          <a href="#" className="text-primary hover:text-primary/80 underline">
            Terms of Service
          </a>{" "}
          and{" "}
          <a href="#" className="text-primary hover:text-primary/80 underline">
            Privacy Policy
          </a>
          .
        </div>
      </div>
    </div>
  );
}
