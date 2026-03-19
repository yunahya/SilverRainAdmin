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
import { Bar, BarChart, XAxis, YAxis, CartesianGrid } from "recharts";
import type { ChatLog } from "@/types/chatbot";

interface SourceUsageChartProps {
  logs: ChatLog[];
}

const COLORS = [
  "hsl(215, 20%, 50%)",
  "hsl(265, 20%, 55%)",
  "hsl(160, 20%, 48%)",
  "hsl(25, 25%, 55%)",
  "hsl(350, 25%, 55%)",
];

const chartConfig = {
  count: { label: "사용 횟수", color: "hsl(221, 83%, 53%)" },
};

export function SourceUsageChart({ logs }: SourceUsageChartProps) {
  const sourceMap = new Map<string, number>();
  logs.forEach((l) => {
    l.sources.forEach((s) => {
      sourceMap.set(s, (sourceMap.get(s) || 0) + 1);
    });
  });

  const data = Array.from(sourceMap.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold">도구 사용 빈도</CardTitle>
        <CardDescription className="text-xs">
          에이전트 도구별 호출 횟수
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-2">
        {data.length === 0 ? (
          <div className="flex h-[200px] items-center justify-center text-sm text-muted-foreground">
            도구 사용 데이터가 없습니다
          </div>
        ) : (
          <ChartContainer config={chartConfig} className="h-[200px] w-full">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="name" fontSize={10} tickLine={false} axisLine={false} />
              <YAxis fontSize={11} tickLine={false} axisLine={false} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="count" radius={[6, 6, 0, 0]} maxBarSize={40}>
                {data.map((_, idx) => (
                  <Bar
                    key={idx}
                    dataKey="count"
                    fill={COLORS[idx % COLORS.length]}
                  />
                ))}
              </Bar>
            </BarChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}
