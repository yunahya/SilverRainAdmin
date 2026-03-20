"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { ThumbsUp, ThumbsDown, Bot, User, Clock, Wrench } from "lucide-react";
import { formatKST } from "@/lib/date";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { ChatLog } from "@/types/chatbot";

interface ConversationDetailProps {
  sessionId: string;
  messages: ChatLog[];
}

const REASON_LABELS: Record<string, string> = {
  INACCURATE: "부정확",
  IRRELEVANT: "무관련",
  INCOMPLETE: "불완전",
  HARD_TO_UNDERSTAND: "이해 어려움",
  OUTDATED: "오래된 정보",
  OTHER: "기타",
};

export function ConversationDetail({ sessionId, messages }: ConversationDetailProps) {
  const totalLatency = messages.reduce((s, m) => s + m.latency_ms, 0);
  const avgLatency = messages.length ? (totalLatency / messages.length / 1000).toFixed(1) : "0";
  const feedbackCount = messages.filter((m) => m.feedback_type).length;

  return (
    <Card className="h-full flex flex-col">
      {/* 세션 헤더 */}
      <CardHeader className="pb-3 border-b">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <CardTitle className="text-sm font-semibold">세션 상세</CardTitle>
            <p className="text-[11px] font-mono text-muted-foreground">{sessionId}</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-center">
              <p className="text-lg font-bold">{messages.length}</p>
              <p className="text-[10px] text-muted-foreground">메시지</p>
            </div>
            <Separator orientation="vertical" className="h-8" />
            <div className="text-center">
              <p className="text-lg font-bold">{avgLatency}s</p>
              <p className="text-[10px] text-muted-foreground">평균 응답</p>
            </div>
            <Separator orientation="vertical" className="h-8" />
            <div className="text-center">
              <p className="text-lg font-bold">{feedbackCount}</p>
              <p className="text-[10px] text-muted-foreground">피드백</p>
            </div>
          </div>
        </div>
      </CardHeader>

      {/* 대화 타임라인 */}
      <CardContent className="p-0 flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="p-4 space-y-5">
            {messages.map((msg, idx) => (
              <div key={msg.question_id} className="space-y-3">
                {idx > 0 && <Separator />}

                {/* 사용자 질문 */}
                <div className="flex gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100">
                    <User className="h-4 w-4 text-slate-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="mb-1.5 flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-semibold">사용자</span>
                      <Badge variant="outline" className="text-[10px] px-1 py-0 font-mono">
                        #{msg.message_sequence}
                      </Badge>
                      <span className="text-[11px] text-muted-foreground">
                        {formatKST(msg.created_at)}
                      </span>
                    </div>
                    <div className="rounded-lg bg-slate-50 px-3 py-2">
                      <p className="text-sm">{msg.question_text}</p>
                    </div>
                  </div>
                </div>

                {/* 챗봇 답변 */}
                <div className="flex gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-violet-50">
                    <Bot className="h-4 w-4 text-violet-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="mb-1.5 flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-semibold">챗봇</span>
                      <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {(msg.latency_ms / 1000).toFixed(1)}s
                      </div>
                      <Badge
                        variant={msg.answer_status === "SUCCESS" ? "default" : "destructive"}
                        className="text-[10px] px-1 py-0"
                      >
                        {msg.answer_status === "SUCCESS" ? "성공" : "실패"}
                      </Badge>
                    </div>

                    <div className="rounded-lg border bg-card px-3 py-2">
                      {msg.chatbot_answer ? (
                        <div className="markdown-body">
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.chatbot_answer}</ReactMarkdown>
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground italic">(응답 없음)</p>
                      )}
                    </div>

                    {/* 메타 정보 */}
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      {/* 사용된 도구 */}
                      {msg.sources.length > 0 && (
                        <div className="flex items-center gap-1">
                          <Wrench className="h-3 w-3 text-muted-foreground" />
                          {msg.sources.map((s) => (
                            <Badge key={s} variant="secondary" className="text-[10px] px-1.5 py-0">
                              {s}
                            </Badge>
                          ))}
                        </div>
                      )}

                      {/* 피드백 */}
                      {msg.feedback_type && (
                        <div className="flex items-center gap-1.5 rounded-md bg-muted px-2 py-1">
                          {msg.feedback_type === "LIKE" ? (
                            <ThumbsUp className="h-3 w-3 text-blue-500" />
                          ) : (
                            <ThumbsDown className="h-3 w-3 text-red-500" />
                          )}
                          <span className="text-[11px] font-medium">
                            {msg.feedback_type === "LIKE"
                              ? "좋아요"
                              : REASON_LABELS[msg.feedback_reason_type || ""] || "싫어요"}
                          </span>
                          {msg.comment && (
                            <span className="text-[11px] text-muted-foreground">
                              &quot;{msg.comment}&quot;
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
