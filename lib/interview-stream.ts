/**
 * Đọc câu hỏi phỏng vấn theo kiểu chảy dần, thay vì chờ cả câu rồi mới hiện.
 *
 * Dùng `fetch` + `ReadableStream` chứ KHÔNG dùng `EventSource`, và có hai lý do:
 *
 * 1. `EventSource` chỉ GET được, mà gửi câu trả lời thì cần POST — sẽ thành hai
 *    vòng (POST lưu, rồi GET nghe), tức là thêm một chặng độ trễ ở đúng chỗ
 *    đang muốn cắt độ trễ.
 * 2. Phần "tự động kết nối lại" của `EventSource` ở đây là BẤT LỢI: nó sẽ mở
 *    lại request và sinh thêm một lượt gọi model, mà lượt gọi ấy tốn tiền và
 *    sinh ra một câu hỏi khác câu đang dở trên màn.
 */

/** Backend đóng kết nối đột ngột khi lượt hỏng — đó là tín hiệu, không phải sự cố mạng. */
export class InterviewStreamError extends Error {}

export interface StreamTurnOptions {
  runId: string;
  answer: string;
  /** Gọi lại sau mỗi mẩu chữ, với TOÀN BỘ phần đã nhận được tới lúc đó. */
  onText: (fullText: string) => void;
  signal?: AbortSignal;
}

const API =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";

/**
 * Gửi câu trả lời, nhận câu hỏi tiếp theo từng mẩu một.
 *
 * Trả về toàn bộ chữ khi xong. Ném `InterviewStreamError` khi stream đứt giữa
 * chừng — người gọi có trách nhiệm XOÁ phần chữ dở đi, đừng giữ lại trên màn:
 * nửa câu hỏi phỏng vấn tệ hơn không có câu nào, vì người dùng không biết câu
 * hỏi đã hết chưa và có thể trả lời một câu chưa hỏi xong.
 */
export async function streamInterviewTurn({
  runId,
  answer,
  onText,
  signal,
}: StreamTurnOptions): Promise<string> {
  const response = await fetch(`${API}/agent-runs/${runId}/turn`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text: answer }),
    signal,
  });

  if (!response.ok) {
    throw new InterviewStreamError(
      response.status === 401
        ? "Phiên đăng nhập đã hết hạn."
        : `Máy chủ trả về HTTP ${response.status}`,
    );
  }
  if (!response.body) {
    throw new InterviewStreamError("Trình duyệt không đọc được luồng dữ liệu.");
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let full = "";

  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      // `stream: true` để một ký tự tiếng Việt bị cắt đôi giữa hai mẩu vẫn ghép
      // lại đúng, thay vì thành dấu hỏi ngược.
      full += decoder.decode(value, { stream: true });
      onText(full);
    }
  } catch (cause) {
    throw new InterviewStreamError(
      cause instanceof Error && cause.name === "AbortError"
        ? "Đã dừng."
        : "Kết nối đứt giữa chừng.",
    );
  }

  full += decoder.decode();
  if (!full.trim()) {
    throw new InterviewStreamError("Máy chủ không trả về nội dung nào.");
  }

  onText(full);
  return full;
}
