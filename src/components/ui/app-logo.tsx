"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";

type LogoSize = "xs" | "sm" | "md" | "lg" | "xl";

const sizeConfig: Record<LogoSize, { container: string; image: number }> = {
  xs: { container: "w-8 h-8 rounded-lg", image: 32 },
  sm: { container: "w-9 h-9 rounded-xl", image: 36 },
  md: { container: "w-10 h-10 rounded-xl", image: 40 },
  lg: { container: "w-14 h-14 rounded-2xl", image: 56 },
  xl: { container: "w-16 h-16 rounded-2xl", image: 64 },
};

interface AppLogoProps {
  size?: LogoSize;
  className?: string;
  showHoverEffect?: boolean;
}

export function AppLogo({
  size = "md",
  className,
  showHoverEffect = true,
}: AppLogoProps) {
  const config = sizeConfig[size];

  return (
    <div
      className={cn(
        "relative flex items-center justify-center overflow-hidden shadow-md shadow-primary/20",
        config.container,
        showHoverEffect && "transition-transform group-hover:scale-105",
        className
      )}
    >
      <Image
        src="/icons/icon-512x512.svg"
        alt="Gifty"
        width={config.image}
        height={config.image}
        className="w-full h-full"
        priority
      />
      {showHoverEffect && (
        <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
      )}
    </div>
  );
}
