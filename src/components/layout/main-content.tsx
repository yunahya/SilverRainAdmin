"use client";

import { useSidebar } from "@/hooks/use-sidebar";
import { cn } from "@/lib/utils";

export function MainContent({ children }: { children: React.ReactNode }) {
  const { collapsed } = useSidebar();

  return (
    <main
      className={cn(
        "min-h-screen p-5 transition-all duration-200",
        collapsed ? "ml-16" : "ml-56"
      )}
    >
      {children}
    </main>
  );
}
