"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import type { DateRange } from "react-day-picker";

interface DateRangeFilterProps {
  dateRange: DateRange | undefined;
  onDateRangeChange: (range: DateRange | undefined) => void;
}

const PRESETS = [
  { label: "오늘", days: 0 },
  { label: "7일", days: 7 },
  { label: "30일", days: 30 },
  { label: "90일", days: 90 },
];

export function DateRangeFilter({
  dateRange,
  onDateRangeChange,
}: DateRangeFilterProps) {
  const [activePreset, setActivePreset] = useState<number | null>(7);

  const handlePreset = (days: number) => {
    setActivePreset(days);
    const to = new Date();
    const from = new Date();
    from.setDate(from.getDate() - days);
    onDateRangeChange({ from, to });
  };

  const formatDateRange = () => {
    if (!dateRange?.from) return "기간 선택";
    if (!dateRange.to)
      return format(dateRange.from, "yyyy.MM.dd", { locale: ko });
    return `${format(dateRange.from, "yyyy.MM.dd", { locale: ko })} - ${format(dateRange.to, "yyyy.MM.dd", { locale: ko })}`;
  };

  return (
    <div className="flex items-center gap-2">
      {PRESETS.map((preset) => (
        <Button
          key={preset.days}
          variant={activePreset === preset.days ? "default" : "outline"}
          size="sm"
          onClick={() => handlePreset(preset.days)}
        >
          {preset.label}
        </Button>
      ))}

      <Popover>
        <PopoverTrigger
          className={cn(
            "inline-flex items-center justify-start gap-2 rounded-md border border-input bg-background px-3 py-1.5 text-sm font-normal shadow-xs min-w-[200px] cursor-pointer hover:bg-accent hover:text-accent-foreground",
            !dateRange && "text-muted-foreground"
          )}
        >
          <CalendarIcon className="h-4 w-4" />
          {formatDateRange()}
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="range"
            selected={dateRange}
            onSelect={(range) => {
              setActivePreset(null);
              onDateRangeChange(range);
            }}
            numberOfMonths={2}
            locale={ko}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
