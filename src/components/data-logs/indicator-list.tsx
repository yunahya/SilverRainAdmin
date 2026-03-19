"use client";

import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { IndicatorSummary } from "@/types/indicator-change";

interface IndicatorListProps {
  indicators: IndicatorSummary[];
  selectedId: number | null;
  onSelect: (id: number) => void;
}

export function IndicatorList({ indicators, selectedId, onSelect }: IndicatorListProps) {
  return (
    <ScrollArea className="h-[700px]">
      <div className="divide-y">
        {indicators.map((item) => (
          <button
            type="button"
            key={item.id}
            onClick={() => onSelect(item.id)}
            className={cn(
              "flex w-full flex-col gap-1 px-3 py-3 text-left transition-colors cursor-pointer",
              selectedId === item.id
                ? "bg-primary/5 border-l-2 border-l-primary"
                : "hover:bg-accent"
            )}
          >
            <p className="text-sm font-medium line-clamp-1">{item.indicator_name}</p>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <code className="rounded bg-muted px-1 py-0.5 text-[10px]">
                {item.indicator_code}
              </code>
              <span className="text-[10px]">{item.medium_category_name}</span>
            </div>
            <p className="text-[11px] text-muted-foreground">{item.unit_name}</p>
          </button>
        ))}
      </div>
    </ScrollArea>
  );
}
