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
    "ID",
    "세션ID",
    "순서",
    "질문",
    "답변",
    "응답상태",
    "피드백",
    "피드백사유",
    "코멘트",
    "사용도구",
    "응답시간(ms)",
    "응답시간(s)",
    "시간(KST)",
  ];

  const rows = logs.map((log) => [
    String(log.id),
    log.session_id,
    String(log.message_sequence),
    escapeCsv(log.question_text),
    escapeCsv(log.chatbot_answer || ""),
    log.answer_status,
    log.feedback_type || "",
    log.feedback_reason_type || "",
    escapeCsv(log.comment || ""),
    log.sources.join(", "),
    String(log.latency_ms),
    (log.latency_ms / 1000).toFixed(1),
    formatKST(log.created_at),
  ]);

  const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
  const date = formatKST(new Date().toISOString(), "yyyyMMdd_HHmm");
  downloadCsv(`chatbot_logs_${date}.csv`, csv);
}

export function exportFeedbackLogs(logs: ChatLog[]) {
  const feedbackLogs = logs.filter((l) => l.feedback_type !== null);

  const headers = [
    "ID",
    "세션ID",
    "질문",
    "답변",
    "피드백",
    "피드백사유",
    "코멘트",
    "사용도구",
    "응답시간(s)",
    "시간(KST)",
  ];

  const rows = feedbackLogs.map((log) => [
    String(log.id),
    log.session_id,
    escapeCsv(log.question_text),
    escapeCsv(log.chatbot_answer || ""),
    log.feedback_type || "",
    log.feedback_reason_type || "",
    escapeCsv(log.comment || ""),
    log.sources.join(", "),
    (log.latency_ms / 1000).toFixed(1),
    formatKST(log.created_at),
  ]);

  const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
  const date = formatKST(new Date().toISOString(), "yyyyMMdd_HHmm");
  downloadCsv(`chatbot_feedback_${date}.csv`, csv);
}
