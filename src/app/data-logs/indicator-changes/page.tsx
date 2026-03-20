"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { IndicatorList } from "@/components/data-logs/indicator-list";
import { IndicatorChangeDetail } from "@/components/data-logs/indicator-change-detail";
import { EnvSwitcher } from "@/components/layout/env-switcher";
import { TableSkeleton } from "@/components/layout/loading-spinner";
import { useEnv } from "@/hooks/use-env";
import { Checkbox } from "@/components/ui/checkbox";
import { Search, GitCompareArrows, RefreshCw, Download } from "lucide-react";
import { formatKST } from "@/lib/date";
import type { Indicator, IndicatorChangeLog, IndicatorSummary } from "@/types/indicator-change";

export default function IndicatorChangesPage() {
  const { env } = useEnv();
  const [allIndicators, setAllIndicators] = useState<Indicator[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [changeLogs, setChangeLogs] = useState<IndicatorChangeLog[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [logLoading, setLogLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [checkedIds, setCheckedIds] = useState<Set<number>>(new Set());
  const [csvLoading, setCsvLoading] = useState(false);

  const toggleCheck = useCallback((id: number) => {
    setCheckedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const loadIndicators = useCallback(async () => {
    setLoading(true);
    setError(null);
    setSelectedId(null);
    setChangeLogs([]);
    try {
      const res = await fetch(`/api/indicators?env=${env}`);
      if (!res.ok) throw new Error(`API error: ${res.status}`);
      const data: Indicator[] = await res.json();
      setAllIndicators(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "데이터를 불러올 수 없습니다");
      setAllIndicators([]);
    } finally {
      setLoading(false);
    }
  }, [env]);

  useEffect(() => {
    loadIndicators();
  }, [loadIndicators]);

  const loadChangeLogs = useCallback(async (indicatorId: number) => {
    
    setLogLoading(true);
    try {
      const res = await fetch(`/api/indicators/log?env=${env}&indicator_id=${indicatorId}`);
      if (!res.ok) throw new Error(`API error: ${res.status}`);
      const data: IndicatorChangeLog[] = await res.json();
      setChangeLogs(data.sort((a, b) => b.created_at.localeCompare(a.created_at)));
    } catch (err) {
      console.error("Failed to load change logs:", err);
      setChangeLogs([]);
    } finally {
      setLogLoading(false);
    }
  }, [env]);

  const handleSelect = useCallback((id: number) => {
    setSelectedId(id);
    loadChangeLogs(id);
  }, [loadChangeLogs]);

  // 중복 제거 (같은 id의 지표는 하나만)
  const indicators: IndicatorSummary[] = useMemo(() => {
    const map = new Map<number, IndicatorSummary>();
    for (const ind of allIndicators) {
      if (!map.has(ind.id)) {
        map.set(ind.id, {
          id: ind.id,
          user_group_id: ind.user_group_id,
          indicator_code: ind.indicator_code,
          indicator_name: ind.indicator_name,
          medium_category_name: ind.medium_category_name,
          unit_name: ind.unit_name,
        });
      }
    }

    let result = Array.from(map.values());

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (i) =>
          String(i.id).includes(q) ||
          String(i.user_group_id).includes(q) ||
          i.indicator_code.toLowerCase().includes(q) ||
          i.indicator_name.toLowerCase().includes(q)
      );
    }

    return result;
  }, [allIndicators, search]);

  const toggleAll = useCallback(() => {
    setCheckedIds((prev) =>
      prev.size === indicators.length
        ? new Set()
        : new Set(indicators.map((i) => i.id))
    );
  }, [indicators]);

  const downloadCsv = useCallback(async () => {
    if (checkedIds.size === 0) return;
    setCsvLoading(true);
    try {
      const allLogs: (IndicatorChangeLog & { indicator_name: string; indicator_code: string })[] = [];
      const promises = Array.from(checkedIds).map(async (id) => {
        const res = await fetch(`/api/indicators/log?env=${env}&indicator_id=${id}`);
        if (!res.ok) return;
        const logs: IndicatorChangeLog[] = await res.json();
        const ind = indicators.find((i) => i.id === id);
        for (const log of logs) {
          allLogs.push({
            ...log,
            indicator_name: ind?.indicator_name ?? "",
            indicator_code: ind?.indicator_code ?? "",
          });
        }
      });
      await Promise.all(promises);

      allLogs.sort((a, b) => b.created_at.localeCompare(a.created_at));

      const headers = ["indicator_id", "indicator_code", "indicator_name", "field_name", "before_value", "after_value", "created_by", "created_at"];
      const rows = allLogs.map((l) => [
        String(l.indicator_id),
        l.indicator_code,
        l.indicator_name,
        l.field_name,
        l.before_value ?? "",
        l.after_value ?? "",
        String(l.created_by),
        formatKST(l.created_at),
      ].map((v) => (v.includes(",") || v.includes('"') || v.includes("\n")) ? `"${v.replace(/"/g, '""')}"` : v));

      const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
      const BOM = "\uFEFF";
      const blob = new Blob([BOM + csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `indicator_change_logs_${formatKST(new Date().toISOString(), "yyyyMMdd_HHmm")}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("CSV download failed:", err);
    } finally {
      setCsvLoading(false);
    }
  }, [checkedIds, env, indicators]);

  const selected = indicators.find((i) => i.id === selectedId);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-xl font-bold">지표변경 로그</h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              지표 데이터 변경 이력 확인
            </p>
          </div>
          <EnvSwitcher />
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="h-8"
            onClick={downloadCsv}
            disabled={loading || checkedIds.size === 0 || csvLoading}
          >
            <Download className={`h-3.5 w-3.5 mr-1.5 ${csvLoading ? "animate-spin" : ""}`} />
            CSV ({checkedIds.size})
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-8"
            onClick={loadIndicators}
            disabled={loading}
          >
            <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${loading ? "animate-spin" : ""}`} />
            새로고침
          </Button>
          <div className="relative w-96">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="지표 ID · 그룹 ID · 지표코드 · 지표명으로 검색"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-9"
            />
          </div>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <p className="font-medium">데이터 로드 실패</p>
          <p className="mt-1 text-xs">{error}</p>
          <Button variant="outline" size="sm" className="mt-2 h-7 text-xs" onClick={loadIndicators}>
            다시 시도
          </Button>
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-5 h-[calc(100vh-9rem)]">
        <div className="lg:col-span-2 min-h-0">
          <Card className="h-full flex flex-col overflow-hidden">
            <div className="border-b px-3 py-2 shrink-0 flex items-center gap-2">
              <Checkbox
                checked={indicators.length > 0 && checkedIds.size === indicators.length}
                onCheckedChange={toggleAll}
                disabled={loading || indicators.length === 0}
              />
              <p className="text-xs font-medium text-muted-foreground">
                {loading ? "로딩 중..." : `${indicators.length}개 지표`}
                {checkedIds.size > 0 && ` (${checkedIds.size}개 선택)`}
              </p>
            </div>
            <div className="flex-1 min-h-0">
              {loading ? (
                <div className="p-3">
                  <TableSkeleton rows={6} />
                </div>
              ) : indicators.length === 0 ? (
                <div className="flex h-32 items-center justify-center text-sm text-muted-foreground">
                  지표가 없습니다
                </div>
              ) : (
                <IndicatorList
                  indicators={indicators}
                  selectedId={selectedId}
                  onSelect={handleSelect}
                  checkedIds={checkedIds}
                  onToggleCheck={toggleCheck}
                />
              )}
            </div>
          </Card>
        </div>

        <div className="lg:col-span-3 min-h-0 overflow-hidden">
          {selected ? (
            <IndicatorChangeDetail
              indicatorName={selected.indicator_name}
              indicatorCode={selected.indicator_code}
              changes={changeLogs}
              loading={logLoading}
            />
          ) : (
            <Card className="flex h-full flex-col items-center justify-center text-muted-foreground">
              <GitCompareArrows className="h-12 w-12 mb-3 opacity-20" />
              <p className="text-sm">왼쪽에서 지표를 선택하세요</p>
              <p className="text-xs mt-1">변경 이력이 여기에 표시됩니다</p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
