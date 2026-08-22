import type { QueryClient } from "@tanstack/react-query";

/**
 * Mọi khoá cache của app, khai ở MỘT chỗ.
 *
 * Vì sao cần: cache biến "đọc lại từ máy chủ" thành "tin vào bản trong máy", nên
 * từ lúc có cache thì mỗi lần GHI phải nói cho mọi bản sao biết. Khoá rải rác
 * dạng chuỗi thì không ai thấy được bản sao nào đang tồn tại, và chỗ ghi sẽ quên
 * một cái.
 *
 * Đã quên thật, và tái hiện được ngày 2026-08-22: bấm Lưu ở trang chi tiết trả
 * về "Đã lưu" đúng, nhưng quay lại danh sách thì nút vẫn là "Lưu". Trang chi tiết
 * xoá `["job", id]`, danh sách nằm ở `["jobs", "list", …]`, hai khoá không biết
 * nhau nên danh sách tin vào bản cũ thêm 30 giây nữa. Người dùng đọc ra thành
 * "bấm hụt".
 *
 * Quy ước: phần tử ĐẦU là nhóm. Xoá cả nhóm bằng tiền tố (`["jobs"]` quét sạch
 * mọi trang, mọi bộ lọc) — nhờ vậy thêm một tham số lọc mới không cần sửa chỗ ghi.
 */
export const keys = {
  authMe: () => ["auth", "me"] as const,

  dashboard: () => ["dashboard", "overview"] as const,

  /** Danh sách tin. Bộ lọc nằm trong khoá nên mỗi tổ hợp là một ô riêng. */
  jobs: () => ["jobs"] as const,
  jobList: (filter: unknown) => ["jobs", "list", filter] as const,
  /** Tiền tố khớp MỌI trang và MỌI bộ lọc của danh sách tin. */
  jobLists: () => ["jobs", "list"] as const,
  jobFilters: () => ["jobs", "filters"] as const,
  /** Chi tiết một tin. Nhóm RIÊNG với `jobs` vì nó gộp cả match và hồ sơ. */
  job: (jobId: string) => ["job", jobId] as const,
  /**
   * Chỉ bản ghi tin, KHÔNG kèm match và hồ sơ.
   *
   * Khoá riêng vì hình dạng dữ liệu khác hẳn `job()` - hai thứ khác hình mà
   * chung khoá thì màn nào đọc sau cũng vỡ. Vẫn nằm dưới tiền tố `job` nên một
   * lệnh xoá quét được cả hai.
   */
  jobRecord: (jobId: string) => ["job", jobId, "record"] as const,

  matches: () => ["matches"] as const,
  /** Thư đã viết và CV đã tạo hỏi CÙNG một danh sách này - cùng khoá, một request. */
  matchList: (limit: number) => ["matches", "list", limit] as const,

  applications: () => ["applications"] as const,
  applicationList: (filter: string, offset: number) =>
    ["applications", "list", filter, offset] as const,

  profile: () => ["profile"] as const,

  documents: () => ["documents"] as const,
  documentList: (kind: string, jobId: string | null, offset: number) =>
    ["documents", kind, jobId, offset] as const,
  cvTemplates: () => ["cv-templates"] as const,
  cvPreview: (draftKey: string) => ["cv-preview", draftKey] as const,

  interview: () => ["interview"] as const,
  interviewList: (offset: number) => ["interview", "list", offset] as const,

  upskill: () => ["upskill", "latest"] as const,

  agentRuns: () => ["agent-runs"] as const,
  agentRunList: (scope: unknown) => ["agent-runs", "list", scope] as const,

  admin: () => ["admin"] as const,
  adminReport: (days: number) => ["admin", "report", days] as const,
  scrapeHistory: () => ["scrape", "history"] as const,
} as const;

/**
 * Một lần ghi làm cũ những nhóm nào — khai theo hành động, không theo màn hình.
 *
 * Khai ở đây thay vì rải trong từng chỗ bấm: cùng một hành động xảy ra ở nhiều
 * màn (lưu tin bấm được ở cả danh sách lẫn trang chi tiết), và hai màn đó phải
 * xoá y hệt nhau. Người thêm chỗ bấm thứ ba chỉ cần gọi đúng tên hành động.
 */
const AFFECTED: Record<string, readonly (readonly string[])[]> = {
  /** Ngôi sao "đã lưu" hiện ở cả thẻ trong danh sách lẫn nút ở trang chi tiết. */
  saveJob: [keys.jobs(), ["job"]],
  /** Bảng đếm theo trạng thái trên màn Tổng quan đọc từ chính bảng đơn ứng tuyển. */
  applicationStatus: [keys.applications(), keys.dashboard()],
  /** Ô "mức độ hoàn thiện hồ sơ" trên Tổng quan tính lại sau mỗi lần lưu. */
  saveProfile: [keys.profile(), keys.dashboard()],
  /** Sinh CV hoặc thư xong thì kho tài liệu có thêm một dòng. */
  createDocument: [keys.documents()],
  /** Chấm điểm lại đổi cả thẻ trong danh sách lẫn số trên Tổng quan. */
  scoreJob: [keys.matches(), keys.jobs(), ["job"], keys.dashboard()],
  /** Bắt đầu hoặc trả lời một lượt agent thì lịch sử chạy có dòng mới. */
  agentRun: [keys.agentRuns()],
};

export type WriteAction = keyof typeof AFFECTED;

/**
 * Xoá mọi nhóm mà một hành động ghi làm cũ.
 *
 * `invalidateQueries` khớp theo TIỀN TỐ, nên `["jobs"]` quét sạch mọi trang và
 * mọi bộ lọc mà không cần liệt kê. Không `await`: người dùng không phải chờ
 * vòng nạp lại mới thấy thao tác của mình có tác dụng.
 */
export function invalidateAfter(
  client: QueryClient,
  action: WriteAction,
): void {
  for (const queryKey of AFFECTED[action]) {
    void client.invalidateQueries({ queryKey });
  }
}
