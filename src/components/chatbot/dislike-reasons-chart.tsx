/** biome-ignore-all lint/suspicious/noArrayIndexKey: <explanation> */
"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Bar, BarChart, XAxis, YAxis, CartesianGrid, Cell } from "recharts";
import type { DislikeReasonDistribution } from "@/types/chatbot";

interface DislikeReasonsChartProps {
  data: DislikeReasonDistribution[];
}

const REASON_LABELS: Record<string, string> = {
  INACCURATE: "부정확",
  IRRELEVANT: "무관련",
  INCOMPLETE: "불완전",
  HARD_TO_UNDERSTAND: "이해 어려움",
  OUTDATED: "오래된 정보",
  OTHER: "기타",
  UNKNOWN: "미분류",
};

const REASON_COLORS: Record<string, string> = {
  INACCURATE: "hsl(350, 35%, 55%)",
  IRRELEVANT: "hsl(25, 40%, 55%)",
  INCOMPLETE: "hsl(265, 25%, 55%)",
  HARD_TO_UNDERSTAND: "hsl(215, 20%, 50%)",
  OUTDATED: "hsl(160, 20%, 48%)",
  OTHER: "hsl(215, 10%, 60%)",
  UNKNOWN: "hsl(215, 10%, 60%)",
};

const chartConfig = {
  count: { label: "건수", color: "hsl(0, 84%, 60%)" },
};

export function DislikeReasonsChart({ data }: DislikeReasonsChartProps) {
  const formatted = data
    .map((d) => ({
      ...d,
      label: REASON_LABELS[d.reason] || d.reason,
      color: REASON_COLORS[d.reason] || "hsl(var(--muted-foreground))",
    }))
    .sort((a, b) => b.count - a.count);

  const total = formatted.reduce((s, d) => s + d.count, 0);

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold">싫어요 사유</CardTitle>
        <CardDescription className="text-xs">
          총 {total}건의 부정 피드백 분포
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-2">
        {formatted.length === 0 ? (
          <div className="flex h-[240px] items-center justify-center text-sm text-muted-foreground">
            싫어요 데이터가 없습니다
          </div>
        ) : (
          <>
            <ChartContainer config={chartConfig} className="h-[200px] w-full">
              <BarChart data={formatted} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--border))" />
                <XAxis type="number" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis
                  dataKey="label"
                  type="category"
                  fontSize={11}
                  width={70}
                  tickLine={false}
                  axisLine={false}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="count" radius={[0, 6, 6, 0]} maxBarSize={24}>
                  {formatted.map((entry, idx) => (
                    <Cell key={idx} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ChartContainer>

            {/* 비율 요약 */}
            <div className="mt-3 space-y-1.5">
              {formatted.map((d) => (
                <div key={d.reason} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div
                      className="h-2 w-2 rounded-full"
                      style={{ backgroundColor: d.color }}
                    />
                    <span className="text-muted-foreground">{d.label}</span>
                  </div>
                  <span className="font-medium">
                    {d.count}건 ({total > 0 ? Math.round((d.count / total) * 100) : 0}%)
                  </span>
                </div>
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
