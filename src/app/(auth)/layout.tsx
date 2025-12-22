import { Gift } from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-background to-muted p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="flex flex-col items-center space-y-2">
          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary text-primary-foreground">
            <Gift className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold">Giftify</h1>
          <p className="text-muted-foreground text-center text-sm">
            Share your wishlists with friends
          </p>
        </div>
        {children}
      </div>
    </div>
  );
}
