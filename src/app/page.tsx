import Link from "next/link";
import { Gift, Users, ShoppingBag, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getUser } from "@/lib/supabase/auth";
import { redirect } from "next/navigation";

export default async function HomePage() {
  const user = await getUser();

  if (user) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b">
        <div className="container max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground">
              <Gift className="w-4 h-4" />
            </div>
            <span className="font-semibold text-lg">Giftify</span>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/login">
              <Button variant="ghost">Sign in</Button>
            </Link>
            <Link href="/signup">
              <Button>Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <section className="py-20 px-4">
          <div className="container max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
              Never wonder what to gift again
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Share your wishlists with friends and family. See what they want.
              Coordinate gifts without spoiling surprises.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/signup">
                <Button size="lg" className="w-full sm:w-auto">
                  Create Your Wishlist
                </Button>
              </Link>
              <Link href="/login">
                <Button size="lg" variant="outline" className="w-full sm:w-auto">
                  Sign in
                </Button>
              </Link>
            </div>
          </div>
        </section>

        <section className="py-20 px-4 bg-muted/50">
          <div className="container max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">How it works</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 text-primary mx-auto mb-4">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Create Wishlists</h3>
                <p className="text-muted-foreground">
                  Add items by pasting links. We automatically fetch product
                  details, images, and prices.
                </p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 text-primary mx-auto mb-4">
                  <Users className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Connect with Friends</h3>
                <p className="text-muted-foreground">
                  Add friends to see their wishlists. Know exactly what they want
                  for their birthday or any occasion.
                </p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 text-primary mx-auto mb-4">
                  <Check className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Coordinate Gifts</h3>
                <p className="text-muted-foreground">
                  Claim items you plan to buy. Others see what&apos;s taken, but the
                  recipient never knows.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="py-20 px-4">
          <div className="container max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4">Ready to get started?</h2>
            <p className="text-xl text-muted-foreground mb-8">
              Create your first wishlist in seconds.
            </p>
            <Link href="/signup">
              <Button size="lg">Create Free Account</Button>
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t py-8 px-4">
        <div className="container max-w-6xl mx-auto text-center text-sm text-muted-foreground">
          <p>Giftify - Share wishlists, coordinate gifts, celebrate together.</p>
        </div>
      </footer>
    </div>
  );
}
