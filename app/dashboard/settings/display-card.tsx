"use client";

import { useSyncExternalStore } from "react";
import { Minus, Monitor, MonitorSmartphone, Moon, Plus, Sun } from "lucide-react";
import { SectionCard } from "@/components/ui/section-card";
import { cn } from "@/utils";
import {
  applyFontScale,
  DEFAULT_PERCENT,
  MAX_PERCENT,
  MIN_PERCENT,
  readFontScale,
  serverFontScale,
  STEP_PERCENT,
  subscribeFontScale,
} from "@/lib/font-scale";
import {
  applyTheme,
  readTheme,
  serverTheme,
  subscribeTheme,
  THEMES,
  type ThemeId,
} from "@/lib/theme";

const THEME_ICON: Record<ThemeId, typeof Sun> = {
  light: Sun,
  dark: Moon,
  system: Monitor,
};

export function DisplayCard() {
  /*
    `localStorage` là trạng thái NGOÀI React, nên đọc bằng `useSyncExternalStore`
    chứ không phải `useState` + `useEffect`: bản dựng trên máy chủ dùng ảnh chụp
    riêng nên không lệch hydration, và không có `setState` chạy đồng bộ trong
    effect để sinh thêm một vòng render.

    Cỡ chữ THẬT của trang đã do thẻ script trong `<head>` đặt từ trước lần vẽ đầu
    tiên - chỗ này chỉ quyết định con số hiện trên nút.
  */
  const percent = useSyncExternalStore(
    subscribeFontScale,
    readFontScale,
    serverFontScale,
  );

  const theme = useSyncExternalStore(subscribeTheme, readTheme, serverTheme);

  const atMin = percent <= MIN_PERCENT;
  const atMax = percent >= MAX_PERCENT;

  return (
    <SectionCard
      icon={MonitorSmartphone}
      title="Giao diện & hiển thị"
      description="Áp cho toàn bộ giao diện, lưu trên trình duyệt này"
      compact
    >
      <p className="mb-2 text-sm font-medium text-slate-700">Giao diện</p>

      <div
        role="radiogroup"
        aria-label="Giao diện"
        className="mb-5 flex rounded-full bg-slate-100 p-1"
      >
        {THEMES.map((option) => {
          const Icon = THEME_ICON[option.id];
          const active = option.id === theme;
          return (
            <button
              key={option.id}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => applyTheme(option.id)}
              className={cn(
                "flex flex-1 items-center justify-center gap-2 rounded-full px-3 py-2 text-sm transition",
                active
                  ? "bg-white font-semibold text-slate-900 shadow-sm"
                  : "text-slate-500 hover:text-slate-700",
              )}
            >
              <Icon className="size-4" />
              {option.label}
            </button>
          );
        })}
      </div>

      <p className="mb-2 text-sm font-medium text-slate-700">Cỡ chữ</p>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1 rounded-full bg-slate-100 p-1">
          <StepButton
            label="Giảm cỡ chữ"
            disabled={atMin}
            onClick={() => applyFontScale(percent - STEP_PERCENT)}
          >
            <Minus className="size-4" />
          </StepButton>

          <output
            aria-live="polite"
            className="min-w-[4.5rem] text-center text-sm font-semibold text-slate-700 tabular-nums"
          >
            {percent}%
          </output>

          <StepButton
            label="Tăng cỡ chữ"
            disabled={atMax}
            onClick={() => applyFontScale(percent + STEP_PERCENT)}
          >
            <Plus className="size-4" />
          </StepButton>
        </div>

        {percent !== DEFAULT_PERCENT && (
          <button
            type="button"
            onClick={() => applyFontScale(DEFAULT_PERCENT)}
            className="text-xs text-slate-500 underline underline-offset-2 hover:text-slate-700"
          >
            Về mặc định
          </button>
        )}
      </div>

      <p className="mt-3 text-xs text-slate-500">
        Đổi cỡ chữ áp ngay cho mọi trang. Lựa chọn lưu riêng cho trình duyệt này
        — máy khác cần chỉnh lại.
      </p>
    </SectionCard>
  );
}

function StepButton({
  label,
  disabled,
  onClick,
  children,
}: {
  label: string;
  disabled: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "flex size-8 items-center justify-center rounded-full transition",
        disabled
          ? "text-slate-300"
          : "bg-white text-slate-600 shadow-sm hover:text-slate-900",
      )}
    >
      {children}
    </button>
  );
}
