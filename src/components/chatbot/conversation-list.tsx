"use client";

import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { timeAgoKST } from "@/lib/date";
import { MessageSquare, ThumbsUp, ThumbsDown } from "lucide-react";
import type { SessionSummary } from "@/types/chatbot";

interface ConversationListProps {
  sessions: SessionSummary[];
  selectedSessionId: string | null;
  onSelectSession: (sessionId: string) => void;
}

export function ConversationList({
  sessions,
  selectedSessionId,
  onSelectSession,
}: ConversationListProps) {
  return (
    <ScrollArea className="h-[700px]">
      <div className="space-y-1 p-2">
        {sessions.map((session) => {
          const isSelected = selectedSessionId === session.session_id;
          return (
            <button
              type="button"
              key={session.session_id}
              onClick={() => onSelectSession(session.session_id)}
              className={cn(
                "w-full text-left rounded-lg p-3 transition-colors cursor-pointer",
                isSelected
                  ? "bg-primary/10 border border-primary/20"
                  : "hover:bg-accent border border-transparent"
              )}
            >
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm font-medium line-clamp-2 flex-1">
                  {session.first_question}
                </p>
                <span
                  className="text-[10px] text-muted-foreground whitespace-nowrap mt-0.5"
                  suppressHydrationWarning
                >
                  {timeAgoKST(session.started_at)}
                </span>
              </div>

              <div className="mt-2 flex items-center gap-2">
                <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                  <MessageSquare className="h-3 w-3" />
                  {session.message_count}
                </div>
                <span className="font-mono text-[10px] text-muted-foreground">
                  {session.session_id.slice(0, 8)}...
                </span>

                {session.has_feedback && (
                  <div className="flex items-center gap-1 ml-auto">
                    {session.like_count > 0 && (
                      <div className="flex items-center gap-0.5 text-violet-400">
                        <ThumbsUp className="h-3 w-3" />
                        <span className="text-[10px]">{session.like_count}</span>
                      </div>
                    )}
                    {session.dislike_count > 0 && (
                      <div className="flex items-center gap-0.5 text-rose-400">
                        <ThumbsDown className="h-3 w-3" />
                        <span className="text-[10px]">{session.dislike_count}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </ScrollArea>
  );
}
