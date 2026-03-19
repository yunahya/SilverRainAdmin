"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { StatsCards } from "@/components/chatbot/stats-cards";
import { DailyChart } from "@/components/chatbot/daily-chart";
import { DislikeReasonsChart } from "@/components/chatbot/dislike-reasons-chart";
import { SourceUsageChart } from "@/components/chatbot/source-usage-chart";
import { LatencyDistribution } from "@/components/chatbot/latency-distribution";
import { RecentLogsTable } from "@/components/chatbot/recent-logs-table";
import { DateRangeFilter } from "@/components/chatbot/date-range-filter";
import { EnvSwitcher } from "@/components/layout/env-switcher";
import { CardSkeleton, ChartSkeleton } from "@/components/layout/loading-spinner";
import { useEnv } from "@/hooks/use-env";
import {
  fetchAllLogs,
  filterLogs,
  computeStats,
  computeDailyStats,
  computeDislikeReasons,
} from "@/lib/api";
import type { ChatLog } from "@/types/chatbot";
import type { DateRange } from "react-day-picker";
import { RefreshCw, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { exportAllLogs } from "@/lib/export-csv";

export default function DashboardPage() {
  const { env } = useEnv();
  const [allLogs, setAllLogs] = useState<ChatLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<DateRange | undefined>(() => {
    const to = new Date();
    const from = new Date();
    from.setDate(from.getDate() - 30);
    return { from, to };
  });

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchAllLogs(env);
      setAllLogs(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "데이터를 불러올 수 없습니다");
      setAllLogs([]);
    } finally {
      setLoading(false);
    }
  }, [env]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filtered = useMemo(() => {
    return filterLogs(allLogs, {
      start_date: dateRange?.from?.toISOString().slice(0, 10),
      end_date: dateRange?.to?.toISOString().slice(0, 10),
    });
  }, [allLogs, dateRange]);

  const stats = useMemo(() => computeStats(filtered), [filtered]);
  const dailyStats = useMemo(() => computeDailyStats(filtered), [filtered]);
  const dislikeReasons = useMemo(() => computeDislikeReasons(filtered), [filtered]);

  return (
    <div className="space-y-5">
      {/* 헤더 */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-xl font-bold">챗봇 대시보드</h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              챗봇 응답 품질 및 사용자 피드백 현황
            </p>
          </div>
          <EnvSwitcher />
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="h-8"
            onClick={() => exportAllLogs(filtered)}
            disabled={loading || filtered.length === 0}
          >
            <Download className="h-3.5 w-3.5 mr-1.5" />
            CSV
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-8"
            onClick={loadData}
            disabled={loading}
          >
            <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${loading ? "animate-spin" : ""}`} />
            새로고침
          </Button>
          <DateRangeFilter
            dateRange={dateRange}
            onDateRangeChange={setDateRange}
          />
        </div>
      </div>

      {/* 에러 상태 */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <p className="font-medium">데이터 로드 실패</p>
          <p className="mt-1 text-xs">{error}</p>
          <Button variant="outline" size="sm" className="mt-2 h-7 text-xs" onClick={loadData}>
            다시 시도
          </Button>
        </div>
      )}

      {/* 로딩 상태 */}
      {loading ? (
        <div className="space-y-5">
          <CardSkeleton />
          <div className="grid gap-4 lg:grid-cols-3">
            <div className="lg:col-span-2"><ChartSkeleton /></div>
            <ChartSkeleton />
          </div>
        </div>
      ) : (
        <>
          <StatsCards stats={stats} />

          <div className="grid gap-4 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <DailyChart data={dailyStats} />
            </div>
            <div>
              <DislikeReasonsChart data={dislikeReasons} />
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <SourceUsageChart logs={filtered} />
            <LatencyDistribution logs={filtered} />
          </div>

          <RecentLogsTable logs={filtered} limit={8} />
        </>
      )}
    </div>
  );
}
