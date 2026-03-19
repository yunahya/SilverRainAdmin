"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useSidebar } from "@/hooks/use-sidebar";
import * as Collapsible from "@radix-ui/react-collapsible";
import {
  MessageSquare,
  BarChart3,
  ThumbsUp,
  Bot,
  ChevronDown,
  PanelLeftClose,
  PanelLeft,
  CloudRain,
  FileClock,
  GitCompareArrows,
} from "lucide-react";

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
}

interface NavModule {
  id: string;
  title: string;
  icon: React.ElementType;
  basePath: string;
  items: NavItem[];
}

const NAV_MODULES: NavModule[] = [
  {
    id: "chatbot",
    title: "챗봇 로그",
    icon: Bot,
    basePath: "/chatbot",
    items: [
      { label: "대시보드", href: "/chatbot/dashboard", icon: BarChart3 },
      { label: "대화 로그", href: "/chatbot/conversations", icon: MessageSquare },
      { label: "피드백 로그", href: "/chatbot/feedback", icon: ThumbsUp },
    ],
  },
  {
    id: "data-logs",
    title: "데이터 변경로그",
    icon: FileClock,
    basePath: "/data-logs",
    items: [
      { label: "지표변경 로그", href: "/data-logs/indicator-changes", icon: GitCompareArrows },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const { collapsed, toggle } = useSidebar();

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-30 flex h-screen flex-col border-r bg-sidebar text-sidebar-foreground transition-all duration-200",
        collapsed ? "w-16" : "w-56"
      )}
    >
      {/* 로고 */}
      <div className="flex h-14 items-center justify-between border-b border-sidebar-border px-3">
        {!collapsed && (
          <Link href="/" className="flex items-center gap-2.5 font-semibold text-sm">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sidebar-foreground/10">
              <CloudRain className="h-4 w-4 text-sidebar-foreground/70" />
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-semibold tracking-wide text-sidebar-foreground/90">
                Silver Rain
              </span>
              <span className="text-[10px] text-sidebar-foreground/40 -mt-0.5">Console</span>
            </div>
          </Link>
        )}
        <button
          type="button"
          onClick={toggle}
          className="flex h-7 w-7 items-center justify-center rounded-md text-sidebar-foreground/50 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors cursor-pointer"
        >
          {collapsed ? <PanelLeft className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
        </button>
      </div>

      {/* 네비게이션 */}
      <nav className="flex-1 overflow-y-auto p-2">
        {NAV_MODULES.map((mod) => {
          const isModuleActive = pathname.startsWith(mod.basePath);

          if (collapsed) {
            return (
              <div key={mod.id} className="mb-1">
                <Link
                  href={mod.items[0].href}
                  className={cn(
                    "flex h-10 w-10 mx-auto items-center justify-center rounded-md transition-colors cursor-pointer",
                    isModuleActive
                      ? "bg-sidebar-primary/20 text-sidebar-primary"
                      : "text-sidebar-foreground/50 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                  )}
                  title={mod.title}
                >
                  <mod.icon className="h-5 w-5" />
                </Link>
              </div>
            );
          }

          return (
            <ModuleSection
              key={mod.id}
              module={mod}
              pathname={pathname}
              defaultOpen={isModuleActive}
            />
          );
        })}
      </nav>

      {/* 하단 프로필 */}
      {!collapsed && (
        <div className="border-t border-sidebar-border p-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-sidebar-foreground/10 text-[11px] font-semibold text-sidebar-foreground/60">
              은
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-medium text-sidebar-foreground/70">양은비</span>
              <span className="text-[10px] text-sidebar-foreground/35">Planner</span>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}

function ModuleSection({
  module: mod,
  pathname,
  defaultOpen,
}: {
  module: NavModule;
  pathname: string;
  defaultOpen: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <Collapsible.Root open={open} onOpenChange={setOpen} className="mb-1">
      <Collapsible.Trigger className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-xs font-medium text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors cursor-pointer">
        <mod.icon className="h-4 w-4" />
        <span className="flex-1 text-left">{mod.title}</span>
        <ChevronDown
          className={cn(
            "h-3 w-3 transition-transform duration-200",
            open && "rotate-180"
          )}
        />
      </Collapsible.Trigger>
      <Collapsible.Content className="overflow-hidden data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0">
        <ul className="ml-3 mt-0.5 space-y-0.5 border-l border-sidebar-border pl-2">
          {mod.items.map((item) => {
            const isActive = pathname === item.href;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors cursor-pointer",
                    isActive
                      ? "bg-sidebar-primary/15 text-sidebar-primary font-medium"
                      : "text-sidebar-foreground/50 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                  )}
                >
                  <item.icon className="h-3.5 w-3.5" />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </Collapsible.Content>
    </Collapsible.Root>
  );
}
