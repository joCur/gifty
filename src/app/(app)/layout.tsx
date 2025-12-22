import { redirect } from "next/navigation";
import { getUser, getProfile } from "@/lib/supabase/auth";
import { BottomNav } from "@/components/navigation/bottom-nav";
import { TopHeader } from "@/components/navigation/top-header";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getUser();

  if (!user) {
    redirect("/login");
  }

  const profile = await getProfile();

  return (
    <div className="min-h-screen flex flex-col bg-background pb-16">
      <TopHeader profile={profile} />
      <main className="flex-1 container max-w-2xl mx-auto px-4 py-4">
        {children}
      </main>
      <BottomNav />
    </div>
  );
}
