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
import {
  Bar,
  BarChart,
  Line,
  LineChart,
  Area,
  AreaChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
  ReferenceLine,
} from "recharts";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { DailyStats } from "@/types/chatbot";

interface DailyChartProps {
  data: DailyStats[];
}

const chartConfig = {
  question_count: { label: "질문 수", color: "hsl(215, 20%, 50%)" },
  like_count: { label: "좋아요", color: "hsl(265, 30%, 60%)" },
  dislike_count: { label: "싫어요", color: "hsl(350, 40%, 60%)" },
  avg_latency_ms: { label: "응답시간(ms)", color: "hsl(160, 25%, 45%)" },
};

export function DailyChart({ data }: DailyChartProps) {
  const formatted = data.map((d) => ({
    ...d,
    date: d.date.slice(5), // MM-DD
    latency_s: +(d.avg_latency_ms / 1000).toFixed(1),
  }));

  const avgLatency = formatted.length
    ? +(formatted.reduce((s, d) => s + d.latency_s, 0) / formatted.length).toFixed(1)
    : 0;

  return (
    <Tabs defaultValue="questions" className="w-full">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div>
            <CardTitle className="text-base font-semibold">일별 추이</CardTitle>
            <CardDescription className="text-xs">
              기간 내 질문 수, 피드백, 응답시간 변화
            </CardDescription>
          </div>
          <TabsList className="h-8">
            <TabsTrigger value="questions" className="text-xs px-3">질문</TabsTrigger>
            <TabsTrigger value="feedback" className="text-xs px-3">피드백</TabsTrigger>
            <TabsTrigger value="latency" className="text-xs px-3">응답시간</TabsTrigger>
          </TabsList>
        </CardHeader>
        <CardContent className="pt-2">
          <TabsContent value="questions" className="mt-0">
            <ChartContainer config={chartConfig} className="h-[280px] w-full">
              <AreaChart data={formatted}>
                <defs>
                  <linearGradient id="fillQuestions" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(215, 20%, 50%)" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="hsl(215, 20%, 50%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="date" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis fontSize={11} tickLine={false} axisLine={false} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Area
                  type="monotone"
                  dataKey="question_count"
                  stroke="hsl(215, 20%, 50%)"
                  fill="url(#fillQuestions)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ChartContainer>
          </TabsContent>

          <TabsContent value="feedback" className="mt-0">
            <ChartContainer config={chartConfig} className="h-[280px] w-full">
              <BarChart data={formatted}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="date" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis fontSize={11} tickLine={false} axisLine={false} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Legend
                  iconType="circle"
                  iconSize={8}
                  wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }}
                />
                <Bar
                  dataKey="like_count"
                  fill="hsl(265, 30%, 60%)"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={32}
                />
                <Bar
                  dataKey="dislike_count"
                  fill="hsl(350, 40%, 60%)"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={32}
                />
              </BarChart>
            </ChartContainer>
          </TabsContent>

          <TabsContent value="latency" className="mt-0">
            <ChartContainer config={chartConfig} className="h-[280px] w-full">
              <LineChart data={formatted}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="date" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis fontSize={11} tickLine={false} axisLine={false} unit="s" />
                <ChartTooltip
                  content={<ChartTooltipContent />}
                  formatter={(value) => [`${value}s`, "응답시간"]}
                />
                <ReferenceLine
                  y={avgLatency}
                  stroke="hsl(var(--muted-foreground))"
                  strokeDasharray="5 5"
                  label={{
                    value: `평균 ${avgLatency}s`,
                    position: "insideTopRight",
                    fontSize: 10,
                    fill: "hsl(var(--muted-foreground))",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="latency_s"
                  name="응답시간(s)"
                  stroke="hsl(160, 25%, 45%)"
                  strokeWidth={2}
                  dot={{ r: 3, fill: "hsl(160, 25%, 45%)" }}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ChartContainer>
          </TabsContent>
        </CardContent>
      </Card>
    </Tabs>
  );
}
