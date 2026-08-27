"use client";

import { useEffect, useState } from "react";
import { CheckCircle, X } from "@phosphor-icons/react/ssr";
import { cn } from "@/utils";

interface ToastProps {
  message: React.ReactNode;
  onClose: () => void;
  duration?: number;
}

export function Toast({ message, onClose, duration = 8000 }: ToastProps) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(onClose, 300);
    }, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  return (
    <div
      className={cn(
        "fixed bottom-4 right-4 z-50 flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-lg transition-all duration-300",
        visible ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0",
      )}
    >
      <CheckCircle className="size-5.5 shrink-0 text-green-500" />
      <p className="text-sm text-slate-700">{message}</p>
      <button
        type="button"
        onClick={() => {
          setVisible(false);
          setTimeout(onClose, 300);
        }}
        className="ml-2 shrink-0 rounded-lg p-1 text-slate-400 hover:bg-slate-100"
      >
        <X className="size-4.5" />
      </button>
    </div>
  );
}
