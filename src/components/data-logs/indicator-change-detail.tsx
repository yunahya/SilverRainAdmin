"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatKST } from "@/lib/date";
import { ArrowRight, Loader2 } from "lucide-react";
import type { IndicatorChangeLog } from "@/types/indicator-change";

interface IndicatorChangeDetailProps {
  indicatorName: string;
  indicatorCode: string;
  changes: IndicatorChangeLog[];
  loading: boolean;
}

export function IndicatorChangeDetail({
  indicatorName,
  indicatorCode,
  changes,
  loading,
}: IndicatorChangeDetailProps) {
  return (
    <Card className="h-[700px] flex flex-col">
      <div className="border-b px-4 py-3">
        <h2 className="text-sm font-semibold">{indicatorName}</h2>
        <div className="flex items-center gap-3 mt-1">
          <code className="rounded bg-muted px-1.5 py-0.5 text-xs text-muted-foreground">
            {indicatorCode}
          </code>
          {!loading && (
            <span className="text-xs text-muted-foreground">
              총 {changes.length}건 변경
            </span>
          )}
        </div>
      </div>

      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : changes.length === 0 ? (
        <div className="flex-1 flex items-center justify-center text-sm text-muted-foreground">
          변경 이력이 없습니다
        </div>
      ) : (
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-3">
            {changes.map((change) => (
              <div key={change.id} className="rounded-lg border p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="text-[10px]">
                    {change.field_name}
                  </Badge>
                  <span className="text-[11px] text-muted-foreground">
                    {formatKST(change.created_at, "MM/dd HH:mm")}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-sm">
                  <span className="rounded bg-red-50 px-2 py-0.5 text-red-700 text-xs line-through">
                    {change.before_value ?? "(없음)"}
                  </span>
                  <ArrowRight className="h-3 w-3 text-muted-foreground shrink-0" />
                  <span className="rounded bg-green-50 px-2 py-0.5 text-green-700 text-xs font-medium">
                    {change.after_value ?? "(없음)"}
                  </span>
                </div>

                <p className="text-[11px] text-muted-foreground">
                  변경자 ID: {change.created_by}
                </p>
              </div>
            ))}
          </div>
        </ScrollArea>
      )}
    </Card>
  );
}
