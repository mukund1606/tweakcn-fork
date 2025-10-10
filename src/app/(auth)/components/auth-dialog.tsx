"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ResponsiveDialog,
  ResponsiveDialogContent,
  ResponsiveDialogHeader,
  ResponsiveDialogTitle,
  ResponsiveDialogTrigger,
} from "@/components/ui/revola";
import { authClient } from "@/lib/auth-client";

const isProduction = process.env.NODE_ENV === "production";

interface AuthDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialMode?: "signin" | "signup";
  trigger?: React.ReactNode; // Optional trigger element
}

export function AuthDialog({
  open,
  onOpenChange,
  initialMode = "signin",
  trigger,
}: AuthDialogProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [isSignIn, setIsSignIn] = useState(initialMode === "signin");

  const getCallbackUrl = () => {
    const baseUrl = pathname || "/editor/theme";
    const queryString = searchParams.toString();
    return queryString ? `${baseUrl}?${queryString}` : baseUrl;
  };

  useEffect(() => {
    if (open) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsSignIn(initialMode === "signin");
    }
  }, [open, initialMode]);

  const handleUserSignUp = async () => {
    try {
      await authClient.signUp.email({
        name: name,
        email: email,
        password: password,
        callbackURL: getCallbackUrl(),
      });
    } catch (error) {
      console.error("User Sign Up Error:", error);
      // Handle error appropriately (e.g., show a toast notification)
    }
  };

  const handleUserSignIn = async () => {
    try {
      await authClient.signIn.email({
        email: email,
        password: password,
        callbackURL: getCallbackUrl(),
      });
    } catch (error) {
      console.error("User Sign In Error:", error);
      // Handle error appropriately (e.g., show a toast notification)
    }
  };

  const toggleMode = () => {
    setIsSignIn(!isSignIn);
  };

  return (
    <ResponsiveDialog open={open} onOpenChange={onOpenChange}>
      {trigger && <ResponsiveDialogTrigger asChild>{trigger}</ResponsiveDialogTrigger>}
      <ResponsiveDialogContent className="overflow-hidden sm:max-w-100">
        <div className="space-y-4">
          <ResponsiveDialogHeader className="sm:pt-8">
            <ResponsiveDialogTitle className="text-center text-2xl font-bold">
              {isSignIn ? "Welcome back" : "Create account"}
            </ResponsiveDialogTitle>
            <p className="text-muted-foreground text-center">
              {isSignIn
                ? "Sign in to your account to continue"
                : "Sign up to get started with tweakcn"}
            </p>
          </ResponsiveDialogHeader>

          <div className="space-y-6 p-6 pt-2">
            {isSignIn ? (
              <div className="space-y-3">
                <Input
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <Input
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <Button onClick={handleUserSignIn}>Sign in</Button>
              </div>
            ) : (
              <div className="space-y-3">
                <Input
                  placeholder="Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
                <Input
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <Input
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <Button onClick={handleUserSignUp}>Sign up</Button>
              </div>
            )}

            {!isProduction && (
              <div className="pt-2">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-muted text-muted-foreground px-2">
                      {isSignIn ? "New to tweakcn?" : "Already have an account?"}
                    </span>
                  </div>
                </div>

                <div className="mt-6 text-center">
                  <button
                    onClick={toggleMode}
                    className="text-primary focus:ring-primary text-sm font-medium hover:underline focus:ring-2 focus:ring-offset-2 focus:outline-none"
                  >
                    {isSignIn ? "Create an account" : "Sign in to your account"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </ResponsiveDialogContent>
    </ResponsiveDialog>
  );
}
