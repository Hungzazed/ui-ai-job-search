import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios";

export const AUTH_COOKIE = "aijob_token";

/**
 * Cookie "còn phiên hay không" — KHÔNG httpOnly, giá trị luôn là '1', và cố ý
 * không chứa bí mật gì. Backend đặt nó song song với hai cookie token.
 *
 * `middleware.ts` đọc cookie này chứ không đọc `AUTH_COOKIE`: access token chỉ
 * sống 15 phút, nên lấy nó làm dấu hiệu "đã đăng nhập" thì người dùng hợp lệ bị
 * đá về /login mỗi 15 phút.
 */
export const SESSION_HINT_COOKIE = "aijob_session";

/**
 * Client gọi thẳng backend NestJS từ trình duyệt.
 *
 * `withCredentials: true` bảo trình duyệt gửi kèm cookie httpOnly mà backend
 * đặt lúc đăng nhập. Không có nó thì cookie tồn tại nhưng không bao giờ được
 * đính vào request, và mọi lời gọi đều nhận 401 — một lỗi đặc biệt khó đoán vì
 * tab Application của DevTools vẫn thấy cookie nằm đó.
 *
 * Phía backend phải có `credentials: true` trong CORS và `origin` là một địa
 * chỉ cụ thể, không được là '*'. Đã cấu hình ở server/src/main.ts.
 */
export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api",
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
  /**
   * Mảng thành `province=HN&province=HCM`, KHÔNG phải `province[]=HN`.
   *
   * Mặc định axios thêm cặp ngoặc vuông vào tên tham số. Express đọc dạng đó ra
   * khoá `province[]`, mà DTO khai `province` - `ValidationPipe` đang bật
   * `forbidNonWhitelisted` nên nó trả 400 "property province[] should not
   * exist" và cả trang lọc việc làm trắng xoá.
   */
  paramsSerializer: {
    serialize: (params: Record<string, unknown>) => {
      const search = new URLSearchParams();
      for (const [key, value] of Object.entries(params)) {
        if (value === undefined || value === null) continue;
        if (Array.isArray(value)) {
          for (const item of value) search.append(key, String(item));
        } else {
          search.append(key, String(value));
        }
      }
      return search.toString();
    },
  },
});

/**
 * Những route KHÔNG được thử lại sau 401.
 *
 * `/auth/refresh` phải nằm đây nếu không interceptor gọi lại chính nó vô tận.
 * Hai route kia thì 401 là câu trả lời ĐÚNG chứ không phải token hết hạn — sai
 * mật khẩu — nên làm mới chỉ thêm một request thừa cho mỗi lần gõ sai.
 *
 * `/auth/me` CỐ Ý KHÔNG nằm đây, dù nó cũng trả 401 khi chưa đăng nhập. Nó là
 * lời gọi khôi phục phiên của `SessionProvider`, tức đúng lời gọi phải sống sót
 * khi access token hết hạn. Loại nó ra thì mọi lần tải trang với access đã hết
 * hạn đều kết thúc ở `/login` — kể cả khi refresh token còn nguyên và những
 * request khác trên cùng trang đã làm mới xong. Đã dính đúng lỗi này.
 */
const NO_RETRY = ["/auth/refresh", "/auth/login", "/auth/register"];

/**
 * Lời gọi refresh đang bay, dùng chung cho mọi request cùng gặp 401.
 *
 * Đây là chỗ mô hình refresh token hay hỏng nhất: một trang dashboard bắn 5-6
 * request song song, access token hết hạn thì CẢ SÁU nhận 401 cùng lúc. Không
 * gom lại thì cả sáu cùng gọi /auth/refresh. Giữ một promise duy nhất ở tầm
 * module khiến request đầu tiên đi gọi thật, năm cái còn lại chờ ké kết quả.
 */
let refreshing: Promise<void> | null = null;

const refreshOnce = (): Promise<void> => {
  refreshing ??= api
    .post("/auth/refresh")
    .then(() => undefined)
    .finally(() => {
      refreshing = null;
    });
  return refreshing;
};

/** Cờ đánh dấu request đã thử lại một lần, để không lặp vô hạn. */
type RetriableConfig = InternalAxiosRequestConfig & { _retried?: boolean };

/**
 * Access token hết hạn thì đổi lấy cái mới rồi chạy lại request, thay vì đá
 * người dùng về màn đăng nhập giữa chừng.
 *
 * Chỉ thử lại ĐÚNG MỘT lần cho mỗi request (`_retried`). Refresh chạy xong mà
 * vẫn 401 nghĩa là phiên đã chết thật - thử tiếp cũng chỉ ra 401, và vòng lặp
 * đó âm thầm bắn hàng nghìn request.
 */
api.interceptors.response.use(
  (response) => response,
  async (error: unknown) => {
    if (!(error instanceof AxiosError)) throw error;

    const config = error.config as RetriableConfig | undefined;
    const url = config?.url ?? "";
    if (
      error.response?.status !== 401 ||
      !config ||
      config._retried ||
      NO_RETRY.some((path) => url.startsWith(path))
    ) {
      throw error;
    }

    config._retried = true;
    try {
      await refreshOnce();
    } catch {
      // Refresh cũng hỏng: phiên đã hết thật. Ném lỗi 401 GỐC ra ngoài để chỗ
      // gọi thấy đúng request nào của mình hỏng, chứ không phải lỗi của một
      // lời gọi nội bộ mà nó chưa từng phát ra.
      throw error;
    }
    return api.request(config);
  },
);

/**
 * Rút thông báo lỗi mà backend gửi kèm.
 *
 * NestJS trả `message` là chuỗi, hoặc MẢNG chuỗi khi ValidationPipe bắt nhiều
 * trường sai cùng lúc. Không xử lý cả hai dạng thì màn hình hiện
 * "[object Object]" đúng vào lúc người dùng cần biết mình nhập sai chỗ nào.
 */
export function apiErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof AxiosError) {
    const message: unknown = error.response?.data?.message;
    if (typeof message === "string") return message;
    if (Array.isArray(message)) return message.join(", ");
    // Không có response nghĩa là request còn chưa tới được máy chủ.
    if (!error.response) return "Không kết nối được tới máy chủ";
  }
  return fallback;
}

/** Trạng thái HTTP, để giao diện phân biệt "sai mật khẩu" với "máy chủ hỏng". */
export const apiErrorStatus = (error: unknown): number | undefined =>
  error instanceof AxiosError ? error.response?.status : undefined;
