// 지표 목록 API 응답
export interface Indicator {
  id: number;
  user_group_id: number;
  medium_category_name: string;
  indicator_code: string;
  indicator_name: string;
  priority_type: string;
  management_cycle: string;
  aggregation_strategy: string;
  summary: string;
  formula: string;
  unit_name: string;
  is_default: boolean;
}

// 지표 변경 로그 API 응답
export interface IndicatorChangeLog {
  id: number;
  indicator_id: number;
  field_name: string;
  before_value: string | null;
  after_value: string | null;
  created_by: number;
  created_at: string; // ISO 8601
}

// 왼쪽 목록용 요약 (프론트 가공)
export interface IndicatorSummary {
  id: number;
  user_group_id: number;
  indicator_code: string;
  indicator_name: string;
  medium_category_name: string;
  unit_name: string;
}
