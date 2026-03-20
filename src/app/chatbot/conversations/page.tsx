"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { ConversationList } from "@/components/chatbot/conversation-list";
import { ConversationDetail } from "@/components/chatbot/conversation-detail";
import { EnvSwitcher } from "@/components/layout/env-switcher";
import { TableSkeleton } from "@/components/layout/loading-spinner";
import { useEnv } from "@/hooks/use-env";
import { fetchAllLogs, groupBySession, getSessionMessages } from "@/lib/api";
import { Search, MessageSquareText, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ChatLog, SessionSummary } from "@/types/chatbot";

export default function ConversationsPage() {
  const { env } = useEnv();
  const [allLogs, setAllLogs] = useState<ChatLog[]>([]);
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    setSelectedSessionId(null);
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

  const sessions: SessionSummary[] = useMemo(() => {
    const grouped = groupBySession(allLogs);
    if (!search) return grouped;
    const q = search.toLowerCase();
    return grouped.filter(
      (s) =>
        s.session_id.toLowerCase().includes(q) ||
        s.first_question.toLowerCase().includes(q)
    );
  }, [allLogs, search]);

  const selectedMessages = useMemo(() => {
    if (!selectedSessionId) return [];
    return getSessionMessages(allLogs, selectedSessionId);
  }, [allLogs, selectedSessionId]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-xl font-bold">대화 로그</h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              세션별 질문-응답 내역 확인
            </p>
          </div>
          <EnvSwitcher />
        </div>
        <div className="flex items-center gap-2">
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
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="세션 ID 또는 질문 검색..."
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
          <Button variant="outline" size="sm" className="mt-2 h-7 text-xs" onClick={loadData}>
            다시 시도
          </Button>
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-5 h-[calc(100vh-9rem)]">
        <div className="lg:col-span-2 min-h-0">
          <Card className="h-full flex flex-col overflow-hidden">
            <div className="border-b px-3 py-2 shrink-0">
              <p className="text-xs font-medium text-muted-foreground">
                {loading ? "로딩 중..." : `${sessions.length}개 세션`}
              </p>
            </div>
            <div className="flex-1 min-h-0">
              {loading ? (
                <div className="p-3">
                  <TableSkeleton rows={6} />
                </div>
              ) : sessions.length === 0 ? (
                <div className="flex h-32 items-center justify-center text-sm text-muted-foreground">
                  세션이 없습니다
                </div>
              ) : (
                <ConversationList
                  sessions={sessions}
                  selectedSessionId={selectedSessionId}
                  onSelectSession={setSelectedSessionId}
                />
              )}
            </div>
          </Card>
        </div>

        <div className="lg:col-span-3 min-h-0 overflow-hidden">
          {selectedSessionId && selectedMessages.length > 0 ? (
            <ConversationDetail
              sessionId={selectedSessionId}
              messages={selectedMessages}
            />
          ) : (
            <Card className="flex h-full flex-col items-center justify-center text-muted-foreground">
              <MessageSquareText className="h-12 w-12 mb-3 opacity-20" />
              <p className="text-sm">왼쪽에서 세션을 선택하세요</p>
              <p className="text-xs mt-1">대화 내용이 여기에 표시됩니다</p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
