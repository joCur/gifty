import { Suspense } from "react";
import { SignupForm } from "./signup-form";
import { Loader2 } from "lucide-react";

function SignupFallback() {
  return (
    <div className="w-full">
      <div className="bg-card border border-border/50 rounded-3xl shadow-xl shadow-black/5 overflow-hidden p-8">
        <div className="flex flex-col items-center justify-center gap-4 py-8">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={<SignupFallback />}>
      <SignupForm />
    </Suspense>
  );
}
