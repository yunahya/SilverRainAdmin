"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import type { ChatLog } from "@/types/chatbot";

interface LatencyDistributionProps {
  logs: ChatLog[];
}

const BUCKETS = [
  { label: "~5s", max: 5000, color: "bg-emerald-500" },
  { label: "5~15s", max: 15000, color: "bg-blue-500" },
  { label: "15~30s", max: 30000, color: "bg-amber-500" },
  { label: "30s~", max: Infinity, color: "bg-red-500" },
];

export function LatencyDistribution({ logs }: LatencyDistributionProps) {
  const bucketCounts = BUCKETS.map((b) => ({
    ...b,
    count: 0,
  }));

  logs.forEach((l) => {
    for (const bucket of bucketCounts) {
      if (l.latency_ms <= bucket.max) {
        bucket.count++;
        break;
      }
    }
  });

  const total = logs.length || 1;

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold">응답시간 분포</CardTitle>
        <CardDescription className="text-xs">
          구간별 응답 소요시간 분포
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-2 space-y-3">
        {bucketCounts.map((bucket) => {
          const pct = Math.round((bucket.count / total) * 100);
          return (
            <div key={bucket.label} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground font-medium">{bucket.label}</span>
                <span className="font-semibold">{bucket.count}건 ({pct}%)</span>
              </div>
              <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                <div
                  className={`h-full rounded-full ${bucket.color} transition-all duration-500`}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
