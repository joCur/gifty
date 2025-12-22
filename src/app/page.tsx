import Link from "next/link";
import { Gift, Users, Sparkles, ArrowRight, Heart, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getUser } from "@/lib/supabase/auth";
import { redirect } from "next/navigation";

export default async function HomePage() {
  const user = await getUser();

  if (user) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen flex flex-col overflow-hidden noise-overlay">
      {/* Animated background blobs */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div
          className="absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full opacity-30 animate-blob"
          style={{
            background: "linear-gradient(135deg, oklch(0.8 0.15 25), oklch(0.85 0.12 50))",
          }}
        />
        <div
          className="absolute top-1/2 -left-32 w-[400px] h-[400px] rounded-full opacity-20 animate-blob"
          style={{
            background: "linear-gradient(135deg, oklch(0.75 0.12 60), oklch(0.8 0.1 80))",
            animationDelay: "-2s",
          }}
        />
        <div
          className="absolute -bottom-20 right-1/3 w-[350px] h-[350px] rounded-full opacity-25 animate-blob"
          style={{
            background: "linear-gradient(135deg, oklch(0.85 0.1 35), oklch(0.9 0.08 55))",
            animationDelay: "-4s",
          }}
        />
      </div>

      {/* Header */}
      <header className="glass fixed top-0 left-0 right-0 z-50">
        <div className="container max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative flex items-center justify-center w-10 h-10 rounded-2xl bg-gradient-to-br from-primary to-primary/80 text-primary-foreground shadow-lg shadow-primary/25 transition-transform group-hover:scale-105">
              <Gift className="w-5 h-5" />
              <div className="absolute inset-0 rounded-2xl bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <span className="font-[family-name:var(--font-outfit)] font-bold text-xl tracking-tight">
              Giftify
            </span>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" className="font-medium">
                Sign in
              </Button>
            </Link>
            <Link href="/signup">
              <Button className="font-medium shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all hover:-translate-y-0.5">
                Get Started
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 pt-16">
        {/* Hero Section */}
        <section className="relative py-24 md:py-32 px-4">
          <div className="container max-w-5xl mx-auto">
            <div className="text-center space-y-8">
              {/* Badge */}
              <div className="opacity-0 animate-fade-up inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-sm font-medium text-primary">
                <Sparkles className="w-4 h-4" />
                <span>The smarter way to gift</span>
              </div>

              {/* Main headline */}
              <h1 className="opacity-0 animate-fade-up delay-100 font-[family-name:var(--font-outfit)] text-5xl md:text-7xl font-bold tracking-tight leading-[1.1]">
                Never wonder{" "}
                <span className="gradient-text">what to gift</span>
                {" "}again
              </h1>

              {/* Subheadline */}
              <p className="opacity-0 animate-fade-up delay-200 text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                Share wishlists with friends and family. See what they actually want.
                Coordinate gifts without spoiling the surprise.
              </p>

              {/* CTA Buttons */}
              <div className="opacity-0 animate-fade-up delay-300 flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                <Link href="/signup">
                  <Button size="lg" className="text-base px-8 h-12 font-semibold shadow-xl shadow-primary/30 hover:shadow-2xl hover:shadow-primary/40 transition-all hover:-translate-y-1">
                    Create Your Wishlist
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
                <Link href="/login">
                  <Button size="lg" variant="outline" className="text-base px-8 h-12 font-semibold hover:bg-secondary transition-all hover:-translate-y-1">
                    I have an account
                  </Button>
                </Link>
              </div>

              {/* Social proof */}
              <div className="opacity-0 animate-fade-up delay-400 pt-8 flex items-center justify-center gap-6 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Heart className="w-4 h-4 text-primary" />
                  <span>Free forever</span>
                </div>
                <div className="w-1 h-1 rounded-full bg-muted-foreground/30" />
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-primary" />
                  <span>Share with anyone</span>
                </div>
                <div className="w-1 h-1 rounded-full bg-muted-foreground/30" />
                <div className="flex items-center gap-2">
                  <EyeOff className="w-4 h-4 text-primary" />
                  <span>Surprises kept secret</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-24 px-4">
          <div className="container max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="font-[family-name:var(--font-outfit)] text-3xl md:text-4xl font-bold mb-4">
                Gifting made simple
              </h2>
              <p className="text-lg text-muted-foreground max-w-xl mx-auto">
                Three easy steps to perfect gifts every time
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6 md:gap-8">
              {/* Feature 1 */}
              <div className="group relative p-8 rounded-3xl bg-card border border-border/50 shadow-sm hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 hover:-translate-y-2">
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center mb-6 shadow-lg shadow-amber-500/25 group-hover:scale-110 transition-transform">
                    <Gift className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="font-[family-name:var(--font-outfit)] text-xl font-semibold mb-3">
                    Create Wishlists
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Add items by pasting links. We automatically fetch product details, images, and prices for you.
                  </p>
                </div>
              </div>

              {/* Feature 2 */}
              <div className="group relative p-8 rounded-3xl bg-card border border-border/50 shadow-sm hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 hover:-translate-y-2">
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-rose-400 to-pink-500 flex items-center justify-center mb-6 shadow-lg shadow-rose-500/25 group-hover:scale-110 transition-transform">
                    <Users className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="font-[family-name:var(--font-outfit)] text-xl font-semibold mb-3">
                    Connect with Friends
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Add friends to see their wishlists. Know exactly what they want for birthdays or any occasion.
                  </p>
                </div>
              </div>

              {/* Feature 3 */}
              <div className="group relative p-8 rounded-3xl bg-card border border-border/50 shadow-sm hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 hover:-translate-y-2">
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center mb-6 shadow-lg shadow-emerald-500/25 group-hover:scale-110 transition-transform">
                    <Eye className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="font-[family-name:var(--font-outfit)] text-xl font-semibold mb-3">
                    Coordinate Secretly
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Claim items you plan to buy. Others see what&apos;s taken, but the recipient never knows.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* How it works visual */}
        <section className="py-24 px-4 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-muted/50 to-transparent" />
          <div className="container max-w-4xl mx-auto relative">
            <div className="bg-card rounded-3xl border border-border/50 p-8 md:p-12 shadow-xl">
              <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
                <div className="space-y-6">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 text-sm font-medium">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    No more duplicate gifts
                  </div>
                  <h3 className="font-[family-name:var(--font-outfit)] text-2xl md:text-3xl font-bold">
                    Everyone stays in sync, surprises stay secret
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    When someone claims an item from a wishlist, all friends see it&apos;s been claimed - but the wishlist owner sees nothing. Perfect coordination, zero spoilers.
                  </p>
                  <Link href="/signup">
                    <Button className="mt-2 shadow-lg shadow-primary/25">
                      Try it free
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                </div>
                <div className="relative">
                  {/* Visual representation */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-4 p-4 rounded-2xl bg-muted/50 border border-border/50">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-100 to-amber-200 flex items-center justify-center text-2xl">
                        🎧
                      </div>
                      <div className="flex-1">
                        <div className="font-medium">Wireless Headphones</div>
                        <div className="text-sm text-muted-foreground">$149.99</div>
                      </div>
                      <div className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 text-xs font-medium">
                        Claimed
                      </div>
                    </div>
                    <div className="flex items-center gap-4 p-4 rounded-2xl bg-muted/50 border border-border/50">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center text-2xl">
                        📚
                      </div>
                      <div className="flex-1">
                        <div className="font-medium">Book Collection</div>
                        <div className="text-sm text-muted-foreground">$45.00</div>
                      </div>
                      <div className="px-3 py-1 rounded-full bg-muted text-muted-foreground text-xs font-medium">
                        Available
                      </div>
                    </div>
                    <div className="flex items-center gap-4 p-4 rounded-2xl bg-muted/50 border border-border/50 opacity-60">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-100 to-purple-200 flex items-center justify-center text-2xl">
                        🎮
                      </div>
                      <div className="flex-1">
                        <div className="font-medium">Gaming Controller</div>
                        <div className="text-sm text-muted-foreground">$69.99</div>
                      </div>
                      <div className="px-3 py-1 rounded-full bg-rose-500/10 text-rose-600 text-xs font-medium">
                        Claimed
                      </div>
                    </div>
                  </div>
                  {/* Friend indicator */}
                  <div className="absolute -top-4 -right-4 px-3 py-2 rounded-xl bg-card border border-border shadow-lg text-xs font-medium flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary to-primary/80" />
                    <span>Friend&apos;s view</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-24 px-4">
          <div className="container max-w-3xl mx-auto text-center">
            <div className="relative p-12 rounded-3xl overflow-hidden">
              {/* Background gradient */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary/90 to-primary/80 animate-gradient" />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.15),transparent_50%)]" />

              <div className="relative space-y-6">
                <h2 className="font-[family-name:var(--font-outfit)] text-3xl md:text-4xl font-bold text-primary-foreground">
                  Ready to make gifting easier?
                </h2>
                <p className="text-lg text-primary-foreground/80 max-w-lg mx-auto">
                  Join Giftify and start sharing wishlists with friends and family today.
                </p>
                <Link href="/signup">
                  <Button size="lg" variant="secondary" className="text-base px-8 h-12 font-semibold shadow-xl hover:-translate-y-1 transition-all mt-4">
                    Create Free Account
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t py-8 px-4">
        <div className="container max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-gradient-to-br from-primary to-primary/80 text-primary-foreground">
              <Gift className="w-4 h-4" />
            </div>
            <span className="font-[family-name:var(--font-outfit)] font-semibold">Giftify</span>
          </div>
          <p className="text-sm text-muted-foreground">
            Share wishlists, coordinate gifts, celebrate together.
          </p>
        </div>
      </footer>
    </div>
  );
}
