"use client";

import { useRef, memo, useCallback } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { cn } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";
import type { IndicatorSummary } from "@/types/indicator-change";

interface IndicatorListProps {
  indicators: IndicatorSummary[];
  selectedId: number | null;
  onSelect: (id: number) => void;
  checkedIds: Set<number>;
  onToggleCheck: (id: number) => void;
}

const ITEM_HEIGHT = 82;

const IndicatorItem = memo(function IndicatorItem({
  item,
  isSelected,
  isChecked,
  onSelect,
  onToggleCheck,
}: {
  item: IndicatorSummary;
  isSelected: boolean;
  isChecked: boolean;
  onSelect: (id: number) => void;
  onToggleCheck: (id: number) => void;
}) {
  return (
    <div
      className={cn(
        "flex items-start gap-2 px-3 py-3 border-b transition-colors",
        isSelected
          ? "bg-primary/5 border-l-2 border-l-primary"
          : "hover:bg-accent"
      )}
    >
      <Checkbox
        checked={isChecked}
        onCheckedChange={() => onToggleCheck(item.id)}
        className="mt-0.5 shrink-0"
      />
      <button
        type="button"
        onClick={() => onSelect(item.id)}
        className="flex flex-col gap-1 text-left flex-1 min-w-0 cursor-pointer"
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
    </div>
  );
});

export function IndicatorList({
  indicators,
  selectedId,
  onSelect,
  checkedIds,
  onToggleCheck,
}: IndicatorListProps) {
  const parentRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: indicators.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => ITEM_HEIGHT,
    overscan: 5,
  });

  const handleSelect = useCallback((id: number) => onSelect(id), [onSelect]);
  const handleToggle = useCallback((id: number) => onToggleCheck(id), [onToggleCheck]);

  return (
    <div ref={parentRef} className="h-full overflow-auto">
      <div
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          width: "100%",
          position: "relative",
        }}
      >
        {virtualizer.getVirtualItems().map((virtualRow) => {
          const item = indicators[virtualRow.index];
          return (
            <div
              key={item.id}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: `${virtualRow.size}px`,
                transform: `translateY(${virtualRow.start}px)`,
              }}
            >
              <IndicatorItem
                item={item}
                isSelected={selectedId === item.id}
                isChecked={checkedIds.has(item.id)}
                onSelect={handleSelect}
                onToggleCheck={handleToggle}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
