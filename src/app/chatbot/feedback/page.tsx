"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { EnvSwitcher } from "@/components/layout/env-switcher";
import { TableSkeleton, CardSkeleton } from "@/components/layout/loading-spinner";
import { useEnv } from "@/hooks/use-env";
import {
  ThumbsUp,
  ThumbsDown,
  ChevronLeft,
  ChevronRight,
  Eye,
  MessageSquare,
  RefreshCw,
  Download,
} from "lucide-react";
import { formatKST } from "@/lib/date";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { fetchAllLogs } from "@/lib/api";
import { exportFeedbackLogs } from "@/lib/export-csv";
import type { ChatLog } from "@/types/chatbot";

const REASON_LABELS: Record<string, string> = {
  INACCURATE: "부정확",
  IRRELEVANT: "무관련",
  INCOMPLETE: "불완전",
  HARD_TO_UNDERSTAND: "이해 어려움",
  OUTDATED: "오래된 정보",
  OTHER: "기타",
};

const PAGE_SIZE = 15;

export default function FeedbackPage() {
  const { env } = useEnv();
  const [allLogs, setAllLogs] = useState<ChatLog[]>([]);
  const [feedbackType, setFeedbackType] = useState<string>("ALL");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  const feedbackLogs = useMemo(() => {
    let filtered = allLogs.filter((l) => l.feedback_type !== null);
    if (feedbackType !== "ALL") {
      filtered = filtered.filter((l) => l.feedback_type === feedbackType);
    }
    return filtered.sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  }, [allLogs, feedbackType]);

  const totalPages = Math.ceil(feedbackLogs.length / PAGE_SIZE);
  const paged = feedbackLogs.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const summary = useMemo(() => {
    const withFeedback = allLogs.filter((l) => l.feedback_type !== null);
    return {
      total: withFeedback.length,
      likes: withFeedback.filter((l) => l.feedback_type === "LIKE").length,
      dislikes: withFeedback.filter((l) => l.feedback_type === "DISLIKE").length,
    };
  }, [allLogs]);

  useEffect(() => {
    setPage(1);
  }, [feedbackType]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-xl font-bold">피드백 로그</h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              사용자 피드백 내역 확인 및 분석
            </p>
          </div>
          <EnvSwitcher />
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="h-8"
            onClick={() => exportFeedbackLogs(allLogs)}
            disabled={loading || allLogs.filter((l) => l.feedback_type).length === 0}
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
          <Select value={feedbackType} onValueChange={(v) => { if (v) setFeedbackType(v); }}>
            <SelectTrigger className="w-[130px] h-9">
              <SelectValue placeholder="피드백 유형" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">전체</SelectItem>
              <SelectItem value="LIKE">좋아요</SelectItem>
              <SelectItem value="DISLIKE">싫어요</SelectItem>
            </SelectContent>
          </Select>
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

      {loading ? (
        <div className="space-y-4">
          <CardSkeleton count={3} />
          <TableSkeleton rows={8} />
        </div>
      ) : (
        <>
          {/* 요약 카드 */}
          <div className="grid grid-cols-3 gap-3">
            <Card>
              <CardContent className="p-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100">
                  <MessageSquare className="h-5 w-5 text-slate-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{summary.total}</p>
                  <p className="text-xs text-muted-foreground">총 피드백</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-50/50">
                  <ThumbsUp className="h-5 w-5 text-violet-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{summary.likes}</p>
                  <p className="text-xs text-muted-foreground">
                    좋아요 ({summary.total > 0 ? Math.round((summary.likes / summary.total) * 100) : 0}%)
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-rose-50/50">
                  <ThumbsDown className="h-5 w-5 text-rose-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{summary.dislikes}</p>
                  <p className="text-xs text-muted-foreground">
                    싫어요 ({summary.total > 0 ? Math.round((summary.dislikes / summary.total) * 100) : 0}%)
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 테이블 */}
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50px]">ID</TableHead>
                    <TableHead>질문</TableHead>
                    <TableHead className="w-[70px]">유형</TableHead>
                    <TableHead className="w-[90px]">사유</TableHead>
                    <TableHead className="w-[80px]">응답시간</TableHead>
                    <TableHead className="w-[110px]">시간</TableHead>
                    <TableHead className="w-[50px]" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paged.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center text-muted-foreground py-12">
                        피드백이 없습니다
                      </TableCell>
                    </TableRow>
                  ) : (
                    paged.map((log) => (
                      <TableRow key={`${log.id}-${log.feedback_id}`}>
                        <TableCell className="text-xs font-mono">{log.feedback_id ?? "-"}</TableCell>
                        <TableCell className="max-w-[300px] truncate text-sm">
                          {log.question_text}
                        </TableCell>
                        <TableCell>
                          {log.feedback_type === "LIKE" ? (
                            <div className="flex items-center gap-1 text-blue-600">
                              <ThumbsUp className="h-3.5 w-3.5" />
                              <span className="text-xs font-medium">좋아요</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1 text-red-600">
                              <ThumbsDown className="h-3.5 w-3.5" />
                              <span className="text-xs font-medium">싫어요</span>
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          {log.feedback_reason_type ? (
                            <Badge variant="outline" className="text-[10px]">
                              {REASON_LABELS[log.feedback_reason_type]}
                            </Badge>
                          ) : (
                            <span className="text-xs text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell className="text-xs font-mono">
                          {(log.latency_ms / 1000).toFixed(1)}s
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {formatKST(log.created_at, "MM/dd HH:mm")}
                        </TableCell>
                        <TableCell>
                          <FeedbackDetailDialog log={log} />
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {feedbackLogs.length > 0 && (
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">
                총 {feedbackLogs.length}건
                {totalPages > 1 &&
                  ` 중 ${(page - 1) * PAGE_SIZE + 1}-${Math.min(page * PAGE_SIZE, feedbackLogs.length)}건`}
              </p>
              {totalPages > 1 && (
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page <= 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-xs font-medium">{page} / {totalPages}</span>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8"
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page >= totalPages}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}

function FeedbackDetailDialog({ log }: { log: ChatLog }) {
  return (
    <Dialog>
      <DialogTrigger className="flex h-7 w-7 items-center justify-center rounded-md hover:bg-accent transition-colors cursor-pointer">
        <Eye className="h-3.5 w-3.5 text-muted-foreground" />
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="text-base">피드백 상세</DialogTitle>
        </DialogHeader>
        <ScrollArea className="max-h-[60vh]">
          <div className="space-y-4">
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-1">질문</p>
              <div className="rounded-lg bg-slate-50 px-3 py-2">
                <p className="text-sm">{log.question_text}</p>
              </div>
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-1">답변</p>
              <div className="rounded-lg border px-3 py-2">
                {log.chatbot_answer ? (
                  <div className="markdown-body">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{log.chatbot_answer}</ReactMarkdown>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground italic">(응답 없음)</p>
                )}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1">피드백</p>
                <div className="flex items-center gap-2">
                  {log.feedback_type === "LIKE" ? (
                    <ThumbsUp className="h-4 w-4 text-blue-500" />
                  ) : (
                    <ThumbsDown className="h-4 w-4 text-red-500" />
                  )}
                  <span className="text-sm font-medium">
                    {log.feedback_type === "LIKE" ? "좋아요" : "싫어요"}
                  </span>
                </div>
              </div>
              {log.feedback_reason_type && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1">사유</p>
                  <Badge variant="outline">
                    {REASON_LABELS[log.feedback_reason_type]}
                  </Badge>
                </div>
              )}
            </div>
            {log.comment && (
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1">코멘트</p>
                <p className="text-sm rounded-lg bg-muted p-2">{log.comment}</p>
              </div>
            )}
            <div className="grid grid-cols-3 gap-4 text-xs text-muted-foreground border-t pt-3">
              <div>
                <span className="block font-medium">응답시간</span>
                <span>{(log.latency_ms / 1000).toFixed(1)}s</span>
              </div>
              <div>
                <span className="block font-medium">도구</span>
                <span>{log.sources.join(", ") || "-"}</span>
              </div>
              <div>
                <span className="block font-medium">시간</span>
                <span>{formatKST(log.created_at)}</span>
              </div>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
