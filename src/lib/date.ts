import { format as dateFnsFormat } from "date-fns";
import { ko } from "date-fns/locale";

/**
 * DB 타임스탬프를 KST Date로 변환
 * DB에 "2026-03-18T07:17:03" (UTC) 로 저장된다고 가정
 * → KST(+9시간)로 변환하여 표시
 */
export function toKST(timestamp: string): Date {
  // 이미 Z나 타임존이 있으면 그대로, 없으면 Z 붙여서 UTC로 명시
  const hasTimezone = /[Zz]|[+-]\d{2}:\d{2}/.test(timestamp);
  return new Date(hasTimezone ? timestamp : timestamp + "Z");
}

/**
 * KST 기준으로 포맷팅
 * timeZone 옵션으로 Asia/Seoul 지정
 */
export function formatKST(timestamp: string, fmt: string = "yyyy.MM.dd HH:mm:ss"): string {
  const date = toKST(timestamp);
  // Intl로 KST 변환 후 date-fns로 포맷
  // 간단하게: KST = UTC + 9h
  const kst = new Date(date.getTime() + 9 * 60 * 60 * 1000);
  return dateFnsFormat(kst, fmt, { locale: ko });
}

/**
 * 상대 시간 (KST 기준)
 * "3시간 전", "2일 전" 등
 */
export function timeAgoKST(timestamp: string): string {
  const date = toKST(timestamp);
  const kst = new Date(date.getTime() + 9 * 60 * 60 * 1000);
  const now = new Date(Date.now() + 9 * 60 * 60 * 1000);
  const diffMs = now.getTime() - kst.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffMin < 1) return "방금 전";
  if (diffMin < 60) return `${diffMin}분 전`;
  if (diffHour < 24) return `${diffHour}시간 전`;
  if (diffDay < 30) return `${diffDay}일 전`;
  return formatKST(timestamp, "yyyy.MM.dd");
}
