/** biome-ignore-all lint/suspicious/noArrayIndexKey: <explanation> */
"use client";

import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  text?: string;
}

export function LoadingSpinner({ className, size = "md", text }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "h-4 w-4 border-2",
    md: "h-8 w-8 border-[3px]",
    lg: "h-12 w-12 border-4",
  };

  return (
    <div className={cn("flex flex-col items-center justify-center gap-3", className)}>
      <div
        className={cn(
          "animate-spin rounded-full border-muted border-t-primary",
          sizeClasses[size]
        )}
      />
      {text && <p className="text-sm text-muted-foreground animate-pulse">{text}</p>}
    </div>
  );
}

export function PageLoader({ text = "데이터를 불러오는 중..." }: { text?: string }) {
  return (
    <div className="flex h-[60vh] items-center justify-center">
      <LoadingSpinner size="lg" text={text} />
    </div>
  );
}

export function CardSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
      {Array.from({ length: count }).map((_, i) => (
        <div key={`card-skeleton-${i}`} className="h-24 rounded-lg bg-muted animate-pulse" />
      ))}
    </div>
  );
}

export function ChartSkeleton() {
  return <div className="h-[340px] rounded-lg bg-muted animate-pulse" />;
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-2">
      <div className="h-10 rounded-md bg-muted animate-pulse" />
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="h-14 rounded-md bg-muted/60 animate-pulse" />
      ))}
    </div>
  );
}
