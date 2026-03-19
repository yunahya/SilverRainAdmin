"use client";

import { Card, CardContent } from "@/components/ui/card";
import {
  MessageSquare,
  Clock,
  CheckCircle,
  ThumbsUp,
  ThumbsDown,
  Percent,
} from "lucide-react";
import type { DashboardStats } from "@/types/chatbot";

interface StatsCardsProps {
  stats: DashboardStats;
}

interface StatCardConfig {
  title: string;
  value: string;
  icon: React.ElementType;
  color: string;
  bgColor: string;
  subtitle?: string;
}

export function StatsCards({ stats }: StatsCardsProps) {
  const totalFeedback = stats.like_count + stats.dislike_count;
  const likeRatio = totalFeedback > 0 ? Math.round((stats.like_count / totalFeedback) * 100) : 0;

  const cards: StatCardConfig[] = [
    {
      title: "총 질문",
      value: stats.total_questions.toLocaleString(),
      icon: MessageSquare,
      color: "text-slate-600",
      bgColor: "bg-slate-100",
      subtitle: `${stats.total_sessions}개 세션`,
    },
    {
      title: "응답 성공률",
      value: `${stats.success_rate}%`,
      icon: CheckCircle,
      color: "text-emerald-600/80",
      bgColor: "bg-emerald-50/60",
      subtitle: stats.success_rate >= 95 ? "양호" : "개선 필요",
    },
    {
      title: "평균 응답시간",
      value: `${(stats.avg_latency_ms / 1000).toFixed(1)}s`,
      icon: Clock,
      color: stats.avg_latency_ms > 30000 ? "text-rose-500/80" : "text-slate-500",
      bgColor: stats.avg_latency_ms > 30000 ? "bg-rose-50/60" : "bg-slate-100",
      subtitle: stats.avg_latency_ms > 30000 ? "느림" : "보통",
    },
    {
      title: "좋아요",
      value: stats.like_count.toLocaleString(),
      icon: ThumbsUp,
      color: "text-violet-500/70",
      bgColor: "bg-violet-50/50",
      subtitle: `긍정률 ${likeRatio}%`,
    },
    {
      title: "싫어요",
      value: stats.dislike_count.toLocaleString(),
      icon: ThumbsDown,
      color: "text-rose-400/70",
      bgColor: "bg-rose-50/50",
      subtitle: totalFeedback > 0 ? `${100 - likeRatio}%` : "-",
    },
    {
      title: "피드백률",
      value: `${stats.feedback_rate}%`,
      icon: Percent,
      color: "text-slate-500",
      bgColor: "bg-slate-100",
      subtitle: `${totalFeedback}건 / ${stats.total_questions}건`,
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
      {cards.map((card) => (
        <Card key={card.title} className="hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground">
                  {card.title}
                </p>
                <p className="text-2xl font-bold tracking-tight">{card.value}</p>
                {card.subtitle && (
                  <p className="text-[11px] text-muted-foreground">{card.subtitle}</p>
                )}
              </div>
              <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${card.bgColor}`}>
                <card.icon className={`h-4 w-4 ${card.color}`} />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
