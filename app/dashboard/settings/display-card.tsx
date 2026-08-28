"use client";

import { useSyncExternalStore } from "react";
import {
  Devices,
  Minus,
  Monitor,
  Moon,
  Plus,
  Sun,
} from "@phosphor-icons/react/ssr";
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
      icon={Devices}
      title="Giao diện & hiển thị"
      description="Áp cho toàn bộ giao diện, lưu trên trình duyệt này"
      compact
    >
      <SettingRow
        label="Giao diện"
        hint="Theo lựa chọn của bạn, hoặc chạy theo cài đặt của máy."
      >
        <div
          role="radiogroup"
          aria-label="Giao diện"
          className="flex w-full rounded-full bg-slate-100 p-1"
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
                  "flex min-w-0 flex-1 items-center justify-center gap-2 rounded-full px-2 py-2 text-sm transition",
                  active
                    ? "bg-white font-semibold text-slate-900 shadow-sm"
                    : "text-slate-500 hover:text-slate-700",
                )}
              >
                <Icon className="size-4.5 shrink-0" />
                <span className="truncate">{option.label}</span>
              </button>
            );
          })}
        </div>
      </SettingRow>

      <SettingRow
        label="Cỡ chữ"
        hint="Áp ngay cho mọi trang. Lưu riêng cho trình duyệt này — máy khác cần chỉnh lại."
      >
        <div className="flex w-full flex-wrap items-center justify-end gap-3">
          {percent !== DEFAULT_PERCENT && (
            <button
              type="button"
              onClick={() => applyFontScale(DEFAULT_PERCENT)}
              className="text-xs text-slate-500 underline underline-offset-2 hover:text-slate-700"
            >
              Về mặc định
            </button>
          )}

          <div className="flex items-center gap-1 rounded-full bg-slate-100 p-1">
            <StepButton
              label="Giảm cỡ chữ"
              disabled={atMin}
              onClick={() => applyFontScale(percent - STEP_PERCENT)}
            >
              <Minus className="size-4.5" />
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
              <Plus className="size-4.5" />
            </StepButton>
          </div>
        </div>
      </SettingRow>
    </SectionCard>
  );
}

function SettingRow({
  label,
  hint,
  children,
}: {
  label: string;
  hint: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid gap-3 border-t border-slate-100 py-4 first:border-t-0 first:pt-0 last:pb-0 sm:grid-cols-[minmax(0,1fr)_minmax(17rem,23rem)] sm:items-center sm:gap-8">
      <div>
        <p className="text-sm font-medium text-slate-700">{label}</p>
        <p className="mt-0.5 text-xs text-slate-500">{hint}</p>
      </div>
      {children}
    </div>
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
