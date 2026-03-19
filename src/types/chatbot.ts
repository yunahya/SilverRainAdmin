// 통합 로그 (질문 + 피드백 한 row)
export interface ChatLog {
  id: number;
  message_sequence: number;
  question_id: string;
  session_id: string;
  question_text: string;
  chatbot_answer: string | null;
  answer_status: "SUCCESS" | "FAILED";
  sources: string[];
  feedback_type: "LIKE" | "DISLIKE" | null;
  feedback_reason_type:
    | "INACCURATE"
    | "IRRELEVANT"
    | "INCOMPLETE"
    | "HARD_TO_UNDERSTAND"
    | "OUTDATED"
    | "OTHER"
    | null;
  comment: string | null;
  latency_ms: number;
  created_at: string; // ISO 8601
}

// 대시보드 통계 (프론트 계산)
export interface DashboardStats {
  total_questions: number;
  total_sessions: number;
  avg_latency_ms: number;
  success_rate: number;
  like_count: number;
  dislike_count: number;
  feedback_rate: number;
}

// 일별 통계 (프론트 계산)
export interface DailyStats {
  date: string;
  question_count: number;
  like_count: number;
  dislike_count: number;
  avg_latency_ms: number;
}

// DISLIKE 사유 분포
export interface DislikeReasonDistribution {
  reason: string;
  count: number;
}

// 세션 요약 (프론트에서 그룹핑)
export interface SessionSummary {
  session_id: string;
  message_count: number;
  first_question: string;
  started_at: string;
  ended_at: string;
  has_feedback: boolean;
  like_count: number;
  dislike_count: number;
}

// 필터 파라미터 (프론트 전용)
export interface LogFilter {
  start_date?: string;
  end_date?: string;
  answer_status?: "SUCCESS" | "FAILED" | "ALL";
  feedback_type?: "LIKE" | "DISLIKE" | "ALL";
  search?: string;
}
