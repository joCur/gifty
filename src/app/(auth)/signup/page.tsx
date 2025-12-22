"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signUp } from "@/lib/supabase/auth";
import { toast } from "sonner";
import { Loader2, Mail, Lock, User, ArrowRight, Sparkles } from "lucide-react";

export default function SignupPage() {
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    if (password !== confirmPassword) {
      toast.error("Passwords don't match");
      return;
    }

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    setIsLoading(true);
    const result = await signUp(formData);
    if (result?.error) {
      toast.error(result.error);
      setIsLoading(false);
    }
  }

  return (
    <div className="w-full">
      {/* Card container */}
      <div className="bg-card border border-border/50 rounded-3xl shadow-xl shadow-black/5 overflow-hidden">
        {/* Header */}
        <div className="px-8 pt-8 pb-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium mb-4">
            <Sparkles className="w-3 h-3" />
            Free forever
          </div>
          <h2 className="font-[family-name:var(--font-outfit)] text-2xl font-bold">
            Create your account
          </h2>
          <p className="text-muted-foreground mt-1">
            Start sharing wishlists in seconds
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-8 pt-6 space-y-5">
          {/* Display Name field */}
          <div className="space-y-2">
            <Label htmlFor="displayName" className="text-sm font-medium">
              Display name
            </Label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="displayName"
                name="displayName"
                type="text"
                placeholder="Your name"
                required
                disabled={isLoading}
                className="h-12 pl-11 rounded-xl bg-muted/50 border-border/50 focus:bg-background transition-colors"
              />
            </div>
          </div>

          {/* Email field */}
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium">
              Email address
            </Label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="you@example.com"
                required
                disabled={isLoading}
                className="h-12 pl-11 rounded-xl bg-muted/50 border-border/50 focus:bg-background transition-colors"
              />
            </div>
          </div>

          {/* Password fields in a grid on larger screens */}
          <div className="grid gap-5 sm:grid-cols-2">
            {/* Password field */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">
                Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Min. 6 characters"
                  required
                  minLength={6}
                  disabled={isLoading}
                  className="h-12 pl-11 rounded-xl bg-muted/50 border-border/50 focus:bg-background transition-colors"
                />
              </div>
            </div>

            {/* Confirm Password field */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-sm font-medium">
                Confirm password
              </Label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  placeholder="Confirm password"
                  required
                  minLength={6}
                  disabled={isLoading}
                  className="h-12 pl-11 rounded-xl bg-muted/50 border-border/50 focus:bg-background transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Submit button */}
          <Button
            type="submit"
            className="w-full h-12 rounded-xl text-base font-semibold shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all hover:-translate-y-0.5"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating account...
              </>
            ) : (
              <>
                Create account
                <ArrowRight className="ml-2 w-4 h-4" />
              </>
            )}
          </Button>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border/50"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-3 text-muted-foreground">
                Already have an account?
              </span>
            </div>
          </div>

          {/* Sign in link */}
          <Link href="/login" className="block">
            <Button
              type="button"
              variant="outline"
              className="w-full h-12 rounded-xl text-base font-medium hover:bg-secondary transition-all"
            >
              Sign in instead
            </Button>
          </Link>
        </form>
      </div>
    </div>
  );
}
