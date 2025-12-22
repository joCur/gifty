import Link from "next/link";
import { Gift } from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col noise-overlay relative overflow-hidden">
      {/* Animated background blobs */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div
          className="absolute -top-32 -right-32 w-[400px] h-[400px] rounded-full opacity-25 animate-blob"
          style={{
            background: "linear-gradient(135deg, oklch(0.8 0.15 25), oklch(0.85 0.12 50))",
          }}
        />
        <div
          className="absolute top-1/3 -left-24 w-[300px] h-[300px] rounded-full opacity-20 animate-blob"
          style={{
            background: "linear-gradient(135deg, oklch(0.75 0.12 60), oklch(0.8 0.1 80))",
            animationDelay: "-3s",
          }}
        />
        <div
          className="absolute -bottom-16 right-1/4 w-[250px] h-[250px] rounded-full opacity-20 animate-blob"
          style={{
            background: "linear-gradient(135deg, oklch(0.85 0.1 35), oklch(0.9 0.08 55))",
            animationDelay: "-5s",
          }}
        />
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md space-y-8">
          {/* Logo and header */}
          <div className="flex flex-col items-center space-y-4">
            <Link href="/" className="group">
              <div className="relative flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-primary/80 text-primary-foreground shadow-xl shadow-primary/25 transition-transform group-hover:scale-105">
                <Gift className="w-8 h-8" />
                <div className="absolute inset-0 rounded-2xl bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </Link>
            <div className="text-center space-y-1">
              <h1 className="font-[family-name:var(--font-outfit)] text-3xl font-bold tracking-tight">
                Giftify
              </h1>
              <p className="text-muted-foreground">
                Share wishlists, coordinate gifts
              </p>
            </div>
          </div>

          {/* Auth form container */}
          {children}
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 text-center">
        <p className="text-xs text-muted-foreground">
          By continuing, you agree to our terms of service and privacy policy.
        </p>
      </div>
    </div>
  );
}
