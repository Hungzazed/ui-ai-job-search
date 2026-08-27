"use client";

import { useState } from "react";
import { Header } from "@/components/dashboard/header";

interface AppLayoutProps {
  children: React.ReactNode;
  sidebar: React.ReactNode;
}

export function AppLayout({ children, sidebar }: AppLayoutProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-surface">
      {/* Desktop sidebar */}
      <div className="fixed inset-y-0 left-0 z-40 hidden lg:block">{sidebar}</div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-slab/60 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <div className="absolute inset-y-0 left-0 flex">
            {sidebar}
            <button
              onClick={() => setMobileOpen(false)}
              className="ml-4 self-center rounded-lg bg-white/10 px-3 py-1 text-xl text-white"
              aria-label="Đóng menu"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col lg:pl-64">
        <Header onMenuClick={() => setMobileOpen(true)} />
        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
