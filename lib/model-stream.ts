export class ModelStreamError extends Error {}

export type ModelStreamEvent<T> =
  | { type: "partial"; data: unknown }
  | { type: "done"; result: T }
  | { type: "error"; message: string };

export interface StreamModelOptions<P> {
  path: string;
  onPartial: (partial: P) => void;
  force?: boolean;
  signal?: AbortSignal;
}

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";

export async function streamModel<T, P = unknown>({
  path,
  onPartial,
  force = false,
  signal,
}: StreamModelOptions<P>): Promise<T> {
  const query = force ? "?force=true" : "";
  const response = await fetch(`${API}${path}${query}`, {
    method: "POST",
    credentials: "include",
    signal,
  });

  if (!response.ok) {
    throw new ModelStreamError(
      response.status === 401
        ? "Phiên đăng nhập đã hết hạn."
        : `Máy chủ trả về HTTP ${response.status}`,
    );
  }
  if (!response.body) {
    throw new ModelStreamError("Trình duyệt không đọc được luồng dữ liệu.");
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let done: T | null = null;

  const take = (line: string) => {
    if (!line.trim()) return;
    let event: ModelStreamEvent<T>;
    try {
      event = JSON.parse(line) as ModelStreamEvent<T>;
    } catch {
      return;
    }
    if (event.type === "partial") onPartial(event.data as P);
    else if (event.type === "done") done = event.result;
    else throw new ModelStreamError(event.message);
  };

  try {
    for (;;) {
      const chunk = await reader.read();
      if (chunk.done) break;
      buffer += decoder.decode(chunk.value, { stream: true });
      let at = buffer.indexOf("\n");
      while (at >= 0) {
        take(buffer.slice(0, at));
        buffer = buffer.slice(at + 1);
        at = buffer.indexOf("\n");
      }
    }
  } catch (cause) {
    if (cause instanceof ModelStreamError) throw cause;
    throw new ModelStreamError(
      cause instanceof Error && cause.name === "AbortError"
        ? "Đã dừng."
        : "Kết nối đứt giữa chừng.",
    );
  }

  buffer += decoder.decode();
  take(buffer);

  if (!done) {
    throw new ModelStreamError("Luồng kết thúc mà không có kết quả cuối.");
  }
  return done;
}
