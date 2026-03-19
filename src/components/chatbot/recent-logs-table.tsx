"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ThumbsUp, ThumbsDown } from "lucide-react";
import { formatKST } from "@/lib/date";
import type { ChatLog } from "@/types/chatbot";

interface RecentLogsTableProps {
  logs: ChatLog[];
  limit?: number;
}

export function RecentLogsTable({ logs, limit = 5 }: RecentLogsTableProps) {
  const recent = [...logs]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, limit);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold">최근 질문</CardTitle>
        <CardDescription className="text-xs">
          가장 최근 {limit}건의 질문-응답
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>질문</TableHead>
              <TableHead className="w-[70px]">상태</TableHead>
              <TableHead className="w-[70px]">응답시간</TableHead>
              <TableHead className="w-[60px]">피드백</TableHead>
              <TableHead className="w-[100px]">시간</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {recent.map((log) => (
              <TableRow key={log.id}>
                <TableCell className="max-w-[300px] truncate text-sm">
                  {log.question_text}
                </TableCell>
                <TableCell>
                  <Badge
                    variant={log.answer_status === "SUCCESS" ? "default" : "destructive"}
                    className="text-[10px] px-1.5 py-0"
                  >
                    {log.answer_status === "SUCCESS" ? "성공" : "실패"}
                  </Badge>
                </TableCell>
                <TableCell className="text-xs font-mono">
                  {(log.latency_ms / 1000).toFixed(1)}s
                </TableCell>
                <TableCell>
                  {log.feedback_type === "LIKE" && (
                    <ThumbsUp className="h-3.5 w-3.5 text-blue-500" />
                  )}
                  {log.feedback_type === "DISLIKE" && (
                    <ThumbsDown className="h-3.5 w-3.5 text-red-500" />
                  )}
                  {!log.feedback_type && (
                    <span className="text-xs text-muted-foreground">-</span>
                  )}
                </TableCell>
                <TableCell className="text-xs text-muted-foreground">
                  {formatKST(log.created_at, "MM/dd HH:mm")}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
