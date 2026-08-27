export const THEMES = [
  { id: "light", label: "Sáng" },
  { id: "dark", label: "Tối" },
  { id: "system", label: "Tự động" },
] as const;

export type ThemeId = (typeof THEMES)[number]["id"];

export const DEFAULT_THEME: ThemeId = "system";
export const THEME_KEY = "aijob:theme";

export const isThemeId = (value: unknown): value is ThemeId =>
  THEMES.some((theme) => theme.id === value);

export function readTheme(): ThemeId {
  if (typeof window === "undefined") return DEFAULT_THEME;
  try {
    const saved = window.localStorage.getItem(THEME_KEY);
    return isThemeId(saved) ? saved : DEFAULT_THEME;
  } catch {
    return DEFAULT_THEME;
  }
}

const listeners = new Set<() => void>();

export function subscribeTheme(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** `system` không phải một bảng màu — nó là "hỏi hệ điều hành". */
export function resolveTheme(id: ThemeId): "light" | "dark" {
  if (id !== "system") return id;
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

export function paintTheme(id: ThemeId): void {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  root.classList.toggle("dark", resolveTheme(id) === "dark");
  root.style.colorScheme = resolveTheme(id);
}

export function applyTheme(id: ThemeId): void {
  paintTheme(id);
  try {
    window.localStorage.setItem(THEME_KEY, id);
  } catch {
    /* chế độ riêng tư chặn ghi: màu vẫn đổi, chỉ không nhớ được. */
  }
  for (const listener of listeners) listener();
}

export const serverTheme = (): ThemeId => DEFAULT_THEME;

/**
 * Đặt chủ đề TRƯỚC khi trang vẽ lần đầu.
 *
 * Không làm bằng React: `useEffect` chạy sau lần vẽ đầu, nên người chọn chế độ
 * tối sẽ thấy một chớp trắng mỗi lần tải trang - khó chịu hơn hẳn so với chớp
 * cỡ chữ, vì nó chói mắt trong phòng tối.
 *
 * Đoạn này cũng đăng ký nghe `prefers-color-scheme`: ở chế độ "Tự động", đổi
 * chủ đề của hệ điều hành phải đổi theo ngay mà không cần tải lại trang.
 */
export const THEME_BOOTSTRAP = `
(function(){
  try {
    var saved = localStorage.getItem(${JSON.stringify(THEME_KEY)}) || 'system';
    var mq = window.matchMedia('(prefers-color-scheme: dark)');
    var paint = function(){
      var dark = saved === 'dark' || (saved === 'system' && mq.matches);
      document.documentElement.classList.toggle('dark', dark);
      document.documentElement.style.colorScheme = dark ? 'dark' : 'light';
    };
    paint();
    mq.addEventListener('change', function(){
      if ((localStorage.getItem(${JSON.stringify(THEME_KEY)}) || 'system') === 'system') paint();
    });
  } catch (e) {}
})();
`;
