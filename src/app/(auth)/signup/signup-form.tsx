"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signUp } from "@/lib/supabase/auth";
import { validateInviteCode } from "@/lib/actions/invites";
import { toast } from "sonner";
import { Loader2, Mail, Lock, User, ArrowRight, Sparkles, AlertCircle, Ticket } from "lucide-react";

export function SignupForm() {
  const searchParams = useSearchParams();
  const inviteCode = searchParams.get("invite");

  const [isLoading, setIsLoading] = useState(false);
  const [isValidating, setIsValidating] = useState(true);
  const [inviteError, setInviteError] = useState<string | null>(null);
  const [inviterName, setInviterName] = useState<string | null>(null);

  useEffect(() => {
    async function checkInvite() {
      if (!inviteCode) {
        setInviteError("An invite code is required to join Gifty. Ask a friend for an invite!");
        setIsValidating(false);
        return;
      }

      const result = await validateInviteCode(inviteCode);
      if (!result.valid) {
        setInviteError(result.error || "Invalid invite code");
      } else {
        setInviterName(result.inviterName || null);
      }
      setIsValidating(false);
    }

    checkInvite();
  }, [inviteCode]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!inviteCode || inviteError) {
      toast.error("Valid invite code required");
      return;
    }

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
    const result = await signUp(formData, inviteCode);
    if (result?.error) {
      toast.error(result.error);
      setIsLoading(false);
    }
  }

  // Loading state while validating invite
  if (isValidating) {
    return (
      <div className="w-full">
        <div className="bg-card border border-border/50 rounded-3xl shadow-xl shadow-black/5 overflow-hidden p-8">
          <div className="flex flex-col items-center justify-center gap-4 py-8">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p className="text-muted-foreground">Validating invite code...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state if no valid invite
  if (inviteError) {
    return (
      <div className="w-full">
        <div className="bg-card border border-border/50 rounded-3xl shadow-xl shadow-black/5 overflow-hidden">
          <div className="p-8">
            <div className="flex flex-col items-center text-center gap-4 py-4">
              <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
                <AlertCircle className="w-8 h-8 text-destructive" />
              </div>
              <div>
                <h2 className="font-[family-name:var(--font-outfit)] text-xl font-bold">
                  Invite Required
                </h2>
                <p className="text-muted-foreground mt-2 max-w-sm">
                  {inviteError}
                </p>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-border/50">
              <Link href="/login" className="block">
                <Button
                  variant="outline"
                  className="w-full h-12 rounded-xl text-base font-medium hover:bg-secondary transition-all"
                >
                  Already have an account? Sign in
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Card container */}
      <div className="bg-card border border-border/50 rounded-3xl shadow-xl shadow-black/5 overflow-hidden">
        {/* Invite code banner */}
        <div className="px-8 pt-6 pb-0">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
            <Ticket className="w-5 h-5 text-emerald-600" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-emerald-700">
                Invited by {inviterName || "a friend"}
              </p>
              <p className="text-xs text-emerald-600/80 font-mono truncate">
                Code: {inviteCode}
              </p>
            </div>
          </div>
        </div>

        {/* Header */}
        <div className="px-8 pt-6 pb-2">
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
