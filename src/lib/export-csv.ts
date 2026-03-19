import type { ChatLog } from "@/types/chatbot";
import { formatKST } from "./date";

function escapeCsv(value: string): string {
  if (value.includes(",") || value.includes('"') || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

function downloadCsv(filename: string, csvContent: string) {
  const BOM = "\uFEFF"; // 엑셀 한글 깨짐 방지
  const blob = new Blob([BOM + csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function exportAllLogs(logs: ChatLog[]) {
  const headers = [
    "user_id",
    "user_group_no",
    "timestamp",
    "question_id",
    "session_id",
    "user_type",
    "question_text",
    "chatbot_answer",
    "answer_status",
    "message_sequence",
    "latency_ms",
    "sources",
  ];

  const rows = logs.map((log) => [
    log.created_by != null ? String(log.created_by) : "",
    log.user_group_id != null ? String(log.user_group_id) : "",
    formatKST(log.created_at),
    log.question_id,
    log.session_id,
    log.user_type || "-",
    escapeCsv(log.question_text),
    escapeCsv(log.chatbot_answer || ""),
    log.answer_status,
    String(log.message_sequence),
    String(log.latency_ms),
    log.sources.join(", "),
  ]);

  const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
  const date = formatKST(new Date().toISOString(), "yyyyMMdd_HHmm");
  downloadCsv(`chatbot_logs_${date}.csv`, csv);
}

export function exportFeedbackLogs(logs: ChatLog[]) {
  const feedbackLogs = logs.filter((l) => l.feedback_type !== null);

  const headers = [
    "user_id",
    "user_group_no",
    "feedback_id",
    "feedback_timestamp",
    "question_id",
    "session_id",
    "feedback_type",
    "feedback_reason_type",
    "feedback_comment",
  ];

  const rows = feedbackLogs.map((log) => [
    log.created_by != null ? String(log.created_by) : "",
    log.user_group_id != null ? String(log.user_group_id) : "",
    log.feedback_id != null ? String(log.feedback_id) : "",
    formatKST(log.created_at),
    log.question_id,
    log.session_id,
    log.feedback_type || "",
    log.feedback_reason_type || "",
    escapeCsv(log.comment || ""),
  ]);

  const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
  const date = formatKST(new Date().toISOString(), "yyyyMMdd_HHmm");
  downloadCsv(`chatbot_feedback_${date}.csv`, csv);
}
