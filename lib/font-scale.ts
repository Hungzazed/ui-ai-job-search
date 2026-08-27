/**
 * Cỡ chữ tính theo PHẦN TRĂM của cỡ gốc, không phải theo mấy nhãn rời.
 *
 * 100% = 16px, đúng cỡ chữ gốc mặc định của trình duyệt. Người dùng tăng giảm
 * từng nấc 10%, nên họ đọc được ngay mình đang ở đâu so với bình thường - thứ
 * mà "Nhỏ / Vừa / Lớn" không nói được.
 */
export const BASE_PX = 16;
export const MIN_PERCENT = 90;
export const MAX_PERCENT = 150;
export const STEP_PERCENT = 10;
export const DEFAULT_PERCENT = 100;

export const FONT_SCALE_KEY = "aijob:font-scale";

export const clampPercent = (value: number): number =>
  Math.min(MAX_PERCENT, Math.max(MIN_PERCENT, Math.round(value / 10) * 10));

export function readFontScale(): number {
  if (typeof window === "undefined") return DEFAULT_PERCENT;
  try {
    const saved = Number(window.localStorage.getItem(FONT_SCALE_KEY));
    return Number.isFinite(saved) && saved > 0
      ? clampPercent(saved)
      : DEFAULT_PERCENT;
  } catch {
    return DEFAULT_PERCENT;
  }
}

const listeners = new Set<() => void>();

export function subscribeFontScale(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function applyFontScale(percent: number): void {
  if (typeof document === "undefined") return;
  const safe = clampPercent(percent);
  document.documentElement.style.fontSize = `${(BASE_PX * safe) / 100}px`;
  try {
    window.localStorage.setItem(FONT_SCALE_KEY, String(safe));
  } catch {
    /* chế độ riêng tư chặn ghi: cỡ chữ vẫn đổi, chỉ không nhớ được. */
  }
  for (const listener of listeners) listener();
}

/** Ảnh chụp cho `useSyncExternalStore`; trên máy chủ luôn là mặc định. */
export const serverFontScale = (): number => DEFAULT_PERCENT;

/**
 * Đặt cỡ chữ TRƯỚC khi trang vẽ lần đầu.
 *
 * Chạy dưới dạng thẻ script nội tuyến trong `<head>`, không phải trong React:
 * một `useEffect` chạy SAU lần vẽ đầu, nên người chọn 150% sẽ thấy trang nhấp
 * nháy từ nhỏ sang to mỗi lần tải. Ở đây đọc `localStorage` đồng bộ và gán
 * ngay, nên không có khoảnh khắc nào hiển thị sai cỡ.
 */
export const FONT_SCALE_BOOTSTRAP = `
(function(){
  try {
    var raw = Number(localStorage.getItem(${JSON.stringify(FONT_SCALE_KEY)}));
    if (!raw) return;
    var pct = Math.min(${MAX_PERCENT}, Math.max(${MIN_PERCENT}, Math.round(raw / 10) * 10));
    document.documentElement.style.fontSize = (${BASE_PX} * pct / 100) + 'px';
  } catch (e) {}
})();
`;
