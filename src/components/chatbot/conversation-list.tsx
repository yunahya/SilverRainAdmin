"use client";

import { useRef, memo, useCallback } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { cn } from "@/lib/utils";
import { timeAgoKST } from "@/lib/date";
import { MessageSquare, ThumbsUp, ThumbsDown } from "lucide-react";
import type { SessionSummary } from "@/types/chatbot";

interface ConversationListProps {
  sessions: SessionSummary[];
  selectedSessionId: string | null;
  onSelectSession: (sessionId: string) => void;
}

const ITEM_HEIGHT = 88;

const SessionItem = memo(function SessionItem({
  session,
  isSelected,
  onSelect,
}: {
  session: SessionSummary;
  isSelected: boolean;
  onSelect: (sessionId: string) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onSelect(session.session_id)}
      className={cn(
        "w-full text-left rounded-lg p-3 mx-2 transition-colors cursor-pointer",
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
});

export function ConversationList({
  sessions,
  selectedSessionId,
  onSelectSession,
}: ConversationListProps) {
  const parentRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: sessions.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => ITEM_HEIGHT,
    overscan: 5,
  });

  const handleSelect = useCallback(
    (sessionId: string) => onSelectSession(sessionId),
    [onSelectSession]
  );

  return (
    <div ref={parentRef} className="h-full overflow-auto">
      <div
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          width: "100%",
          position: "relative",
        }}
      >
        {virtualizer.getVirtualItems().map((virtualRow) => {
          const session = sessions[virtualRow.index];
          return (
            <div
              key={session.session_id}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: `${virtualRow.size}px`,
                transform: `translateY(${virtualRow.start}px)`,
              }}
            >
              <SessionItem
                session={session}
                isSelected={selectedSessionId === session.session_id}
                onSelect={handleSelect}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
