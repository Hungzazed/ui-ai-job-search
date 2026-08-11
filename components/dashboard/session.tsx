"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import type { AuthUser } from "@/types";
import { apiErrorStatus } from "@/lib/axios";
import { authService } from "@/services";

interface SessionValue {
  /** null khi chưa tải xong hoặc chưa đăng nhập. */
  user: AuthUser | null;
  loading: boolean;
  logout: () => Promise<void>;
}

const SessionContext = createContext<SessionValue>({
  user: null,
  loading: true,
  logout: async () => { },
});

/**
 * Nạp người dùng hiện tại MỘT lần cho cả khung dashboard.
 *
 * Cả header lẫn sidebar đều cần tên và email. Không có chỗ dùng chung này thì
 * mỗi component tự gọi `/auth/me`, tức là hai request giống hệt nhau mỗi lần
 * chuyển trang.
 */
export function SessionProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      try {
        const me = await authService.me();
        if (!cancelled) setUser(me);
      } catch (error) {
        // 401 ở đây nghĩa là cookie hết hạn giữa chừng. Đưa về đăng nhập thay
        // vì để khung trang hiện mãi trạng thái trống mà người dùng không hiểu.
        if (!cancelled && apiErrorStatus(error) === 401) {
          router.replace("/login");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [router]);

  const logout = useCallback(async () => {
    // Xoá cookie ở phía máy chủ TRƯỚC rồi mới chuyển trang: đảo thứ tự thì
    // middleware chạy khi cookie vẫn còn và sẽ đẩy ngược về dashboard.
    try {
      await authService.logout();
    } catch {
      // Token hết hạn thì logout cũng trả lỗi, nhưng người dùng vẫn phải ra
      // được. Backend cố ý không đặt guard trên route này vì lý do đó.
    }
    setUser(null);
    router.replace("/login");
    router.refresh();
  }, [router]);

  return (
    <SessionContext.Provider value={{ user, loading, logout }}>
      {children}
    </SessionContext.Provider>
  );
}

export const useSession = () => useContext(SessionContext);
