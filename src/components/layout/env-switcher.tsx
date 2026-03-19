"use client";

import { useEnv } from "@/hooks/use-env";
import { ENVIRONMENTS } from "@/lib/constants";
import { cn } from "@/lib/utils";

const ENV_COLORS: Record<string, string> = {
  dev: "bg-slate-400",
  stg: "bg-amber-400/70",
  prd: "bg-emerald-400/70",
};

export function EnvSwitcher() {
  const { env, setEnv } = useEnv();

  return (
    <div className="flex items-center gap-0.5 rounded-lg bg-secondary p-1">
      {ENVIRONMENTS.map((e) => (
        <button
          type="button"
          key={e.key}
          onClick={() => setEnv(e.key)}
          className={cn(
            "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-all cursor-pointer",
            env === e.key
              ? "bg-background shadow-sm text-foreground"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <div className={cn("h-1.5 w-1.5 rounded-full", ENV_COLORS[e.key])} />
          {e.key.toUpperCase()}
        </button>
      ))}
    </div>
  );
}
