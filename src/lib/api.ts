import type {
  ChatLog,
  DashboardStats,
  DailyStats,
  DislikeReasonDistribution,
  SessionSummary,
  LogFilter,
} from "@/types/chatbot";
import { MOCK_LOGS } from "./mock-data";
import type { EnvKey } from "./constants";

const USE_MOCK = false;

// API에서 오는 raw 데이터 (source가 문자열)
interface RawChatLog {
  id: number;
  message_sequence: number;
  question_id: string;
  session_id: string;
  question_text: string;
  chatbot_answer: string | null;
  answer_status: "SUCCESS" | "FAILED";
  source: string; // "[getManualData, getIndicatorData]"
  feedback_type: "LIKE" | "DISLIKE" | null;
  feedback_reason_type: string | null;
  comment: string | null;
  latency_ms: number;
  created_at: string;
}

// source 문자열 → string[] 파싱
function parseSource(source: string | null | undefined): string[] {
  if (!source) return [];
  return source
    .replace(/[\[\]]/g, "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

function transformRawLog(raw: RawChatLog): ChatLog {
  return {
    ...raw,
    sources: parseSource(raw.source),
    feedback_reason_type: raw.feedback_reason_type as ChatLog["feedback_reason_type"],
  };
}

// --- Raw 데이터 fetch ---

export async function fetchAllLogs(env: EnvKey = "dev"): Promise<ChatLog[]> {
  if (USE_MOCK) return MOCK_LOGS;

  const res = await fetch(`/api/chatbot/logs?env=${env}`);

  if (!res.ok) {
    throw new Error(`API error: ${res.status}`);
  }

  const data = await res.json();

  // 단순 배열 or 래퍼({ data_properties }) 둘 다 지원
  const rawLogs: RawChatLog[] = Array.isArray(data) ? data : data.data_properties ?? [];
  return rawLogs.map(transformRawLog);
}

// --- 필터링 유틸 ---

export function filterLogs(logs: ChatLog[], filter: LogFilter): ChatLog[] {
  return logs.filter((log) => {
    const date = log.created_at.slice(0, 10);
    if (filter.start_date && date < filter.start_date) return false;
    if (filter.end_date && date > filter.end_date) return false;
    if (filter.answer_status && filter.answer_status !== "ALL") {
      if (log.answer_status !== filter.answer_status) return false;
    }
    if (filter.feedback_type && filter.feedback_type !== "ALL") {
      if (log.feedback_type !== filter.feedback_type) return false;
    }
    if (filter.search) {
      const q = filter.search.toLowerCase();
      if (
        !log.question_text.toLowerCase().includes(q) &&
        !log.question_id.toLowerCase().includes(q) &&
        !log.session_id.toLowerCase().includes(q)
      )
        return false;
    }
    return true;
  });
}

// --- 통계 계산 (프론트) ---

export function computeStats(logs: ChatLog[]): DashboardStats {
  const sessions = new Set(logs.map((l) => l.session_id));
  const withFeedback = logs.filter((l) => l.feedback_type !== null);

  return {
    total_questions: logs.length,
    total_sessions: sessions.size,
    avg_latency_ms: logs.length
      ? Math.round(logs.reduce((s, l) => s + l.latency_ms, 0) / logs.length)
      : 0,
    success_rate: logs.length
      ? Math.round(
          (logs.filter((l) => l.answer_status === "SUCCESS").length /
            logs.length) *
            1000
        ) / 10
      : 0,
    like_count: logs.filter((l) => l.feedback_type === "LIKE").length,
    dislike_count: logs.filter((l) => l.feedback_type === "DISLIKE").length,
    feedback_rate: logs.length
      ? Math.round((withFeedback.length / logs.length) * 1000) / 10
      : 0,
  };
}

export function computeDailyStats(logs: ChatLog[]): DailyStats[] {
  const map = new Map<string, { count: number; like: number; dislike: number; latencySum: number }>();

  logs.forEach((l) => {
    const date = l.created_at.slice(0, 10);
    const entry = map.get(date) || { count: 0, like: 0, dislike: 0, latencySum: 0 };
    entry.count += 1;
    entry.latencySum += l.latency_ms;
    if (l.feedback_type === "LIKE") entry.like += 1;
    if (l.feedback_type === "DISLIKE") entry.dislike += 1;
    map.set(date, entry);
  });

  return Array.from(map.entries())
    .map(([date, v]) => ({
      date,
      question_count: v.count,
      like_count: v.like,
      dislike_count: v.dislike,
      avg_latency_ms: Math.round(v.latencySum / v.count),
    }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

export function computeDislikeReasons(logs: ChatLog[]): DislikeReasonDistribution[] {
  const dislikes = logs.filter((l) => l.feedback_type === "DISLIKE");
  const map = new Map<string, number>();

  dislikes.forEach((l) => {
    const reason = l.feedback_reason_type || "UNKNOWN";
    map.set(reason, (map.get(reason) || 0) + 1);
  });

  return Array.from(map.entries()).map(([reason, count]) => ({ reason, count }));
}

// --- 세션 그룹핑 (프론트) ---

export function groupBySession(logs: ChatLog[]): SessionSummary[] {
  const map = new Map<string, ChatLog[]>();

  logs.forEach((l) => {
    const arr = map.get(l.session_id) || [];
    arr.push(l);
    map.set(l.session_id, arr);
  });

  return Array.from(map.entries())
    .map(([sessionId, msgs]) => {
      const sorted = msgs.sort(
        (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      );
      return {
        session_id: sessionId,
        message_count: sorted.length,
        first_question: sorted[0].question_text,
        started_at: sorted[0].created_at,
        ended_at: sorted[sorted.length - 1].created_at,
        has_feedback: sorted.some((m) => m.feedback_type !== null),
        like_count: sorted.filter((m) => m.feedback_type === "LIKE").length,
        dislike_count: sorted.filter((m) => m.feedback_type === "DISLIKE").length,
      };
    })
    .sort((a, b) => new Date(b.started_at).getTime() - new Date(a.started_at).getTime());
}

export function getSessionMessages(logs: ChatLog[], sessionId: string): ChatLog[] {
  return logs
    .filter((l) => l.session_id === sessionId)
    .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
}
