import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/layout/sidebar";
import { EnvProvider } from "@/hooks/use-env";
import { SidebarProvider } from "@/hooks/use-sidebar";
import { MainContent } from "@/components/layout/main-content";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Admin Dashboard",
  description: "내부 관리 대시보드",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className="antialiased bg-muted/30">
        <EnvProvider>
          <SidebarProvider>
            <Sidebar />
            <MainContent>{children}</MainContent>
          </SidebarProvider>
        </EnvProvider>
      </body>
    </html>
  );
}
