/* =========================================================
   Công việc và kết quả chấm điểm
   ========================================================= */

export type SalaryCurrency = "VND" | "USD";
export type SalaryPeriod = "month" | "year";

/**
 * Mốc thời gian hiển thị trên thẻ việc làm.
 *
 * `source` KHÔNG phải chi tiết kỹ thuật thừa. "Đăng 3 ngày trước" và "Thu thập
 * 3 ngày trước" trả lời hai câu khác nhau: câu đầu nói tin còn mới hay không,
 * câu sau nói dữ liệu của ta tươi hay không. Trước đây giao diện gộp cả hai
 * thành một con số không nhãn cạnh biểu tượng lịch — và vì backend chưa bao
 * giờ lưu ngày đăng, con số đó LUÔN là ngày thu thập bị gán nhãn sai.
 */
export interface JobTimestamp {
  /** Nhãn tương đối đã dựng sẵn, ví dụ "3 ngày trước". */
  label: string;
  /** posted = nhà tuyển dụng đăng tin; scraped = hệ thống quét được tin. */
  source: "posted" | "scraped";
  /** Mốc ISO gốc. Nhãn đã bản địa hoá thì không sắp xếp được. */
  at: string;
}

export interface SalaryRange {
  min: number;
  max: number;
  currency: SalaryCurrency;
  period: SalaryPeriod;
}

/**
 * Công việc dạng GIAO DIỆN, đã sẵn sàng đưa vào thẻ `JobCard`.
 *
 * Dựng từ `JobMatchWithJob` bằng `toJobCard()` trong `lib/adapters.ts`.
 * `companyInitials` và `companyColor` không đến từ backend — chúng thuần là
 * chuyện trình bày nên được suy ra từ tên công ty.
 */
export interface Job {
  id: string;
  company: string;
  companyInitials: string;
  companyColor: string;
  /**
   * Ảnh logo thật, khác với hai trường trên vì nó ĐẾN TỪ backend.
   *
   * null với itviec và linkedin — hai portal đó không đưa logo ra trang danh
   * sách. Đó là đường chạy bình thường, và `CompanyLogo` tự lùi về ô chữ cái
   * đầu chứ không để trống.
   */
  companyLogo: string | null;
  title: string;
  location: string;
  /** null khi tin không công bố mức lương bằng con số. */
  salary: SalaryRange | null;
  /**
   * Chuỗi lương nguyên văn từ portal, ví dụ "Đăng nhập để xem mức lương".
   * Nhiều tin trên ITviec không có số, và hiện "0 – 0 triệu/tháng" thì tệ hơn
   * là nói thẳng rằng tin không công bố.
   */
  salaryRaw?: string | null;
  tags: string[];
  postedAt: JobTimestamp;
  strengths: string[];
  /**
   * null nghĩa là CHƯA CHẤM, không phải chấm được 0 điểm.
   *
   * Hai chuyện này khác hẳn nhau và không được gộp: một tin vừa thu thập về
   * chưa qua khâu chấm điểm, còn 0% là kết luận "hồ sơ của bạn không hợp chút
   * nào với tin này". Quy null thành 0 là bịa ra kết luận thứ hai từ chỗ hệ
   * thống chưa nói gì.
   */
  aiMatch: number | null;
  /** Đối chiếu hệ thống. `percent` chỉ có nghĩa với `REQUIREMENTS`. */
  systemMatch: {
    kind: "REQUIREMENTS" | "KEYWORDS";
    met: number;
    total: number;
    percent: number;
  } | null;
  /** Tin này đã có đánh giá AI hay chưa. Thẻ chỉ hiện NHÃN, không hiện số. */
  hasAiScore: boolean;
  saved: boolean;
}

/**
 * Kết quả chấm điểm kèm công việc, hình dạng THẬT backend trả về ở
 * `GET /api/dashboard` và `GET /api/matches`.
 *
 * Mọi điểm đều có thể null: một bản ghi có thể ở trạng thái đang chạy, hoặc
 * model đã trả lời nhưng thiếu chiều nào đó.
 */
export interface JobMatchWithJob {
  jobId: string;
  /** Vòng đời của lượt chấm. `DONE` mới có điểm. */
  status: "PENDING" | "RUNNING" | "DONE" | "FAILED";
  /**
   * Cổng chặn cứng của `04-job-evaluation.md`, chấm TRƯỚC bốn chiều có trọng số.
   *
   * `FAIL` nghĩa là tin đòi quốc tịch hoặc giấy phép lao động mà hồ sơ không
   * đáp ứng, và backend từ chối tạo đơn cho tin đó. Giao diện phải đọc được cờ
   * này để chặn ngay lúc hiển thị, thay vì để người dùng bấm rồi mới ăn lỗi
   * 400 — đó là một kết luận nghiệp vụ, không phải một sự cố.
   *
   * null với những bản ghi chấm trước khi cổng này tồn tại.
   */
  eligibility: "PASS" | "FAIL" | "UNVERIFIED" | null;
  /** Lý do dẫn tới kết luận trên, đã viết sẵn bằng tiếng Việt. */
  eligibilityNote: string | null;
  overallScore: number | null;
  verdict: "STRONG" | "GOOD" | "MODERATE" | "WEAK" | "POOR" | null;
  /** Điểm chấm TRƯỚC lần sửa hồ sơ gần nhất, nên không còn phản ánh hồ sơ hiện tại. */
  stale?: boolean;
  technicalScore: number | null;
  experienceScore: number | null;
  strengths: string[];
  gaps: string[];
  job: {
    id: string;
    title: string;
    company: string;
    companyLogo: string | null;
    location: string | null;
    salaryRaw: string | null;
    salaryMin: number | null;
    salaryMax: number | null;
    currency: string | null;
    tags: string[];
    url: string;
    postedAt: string | null;
    scrapedAt: string;
    /** Backend làm phẳng quan hệ saved_jobs thành cờ này. */
    saved: boolean;
  };
}

/**
 * Phân tích chi tiết cho màn hình Chi tiết công việc.
 *
 * CHƯA có gì đứng sau ở backend. Năm tiêu chí ở đây (`projects`, `level`,
 * `salaryLocation`) không khớp bốn chiều có trọng số của
 * `04-job-evaluation.md`, và `jdSummary` thì backend chưa sinh. Còn dùng mock.
 */
export interface AiMatchDetail {
  overall: number;
  criteria: {
    skills: number;
    experience: number;
    projects: number;
    level: number;
    salaryLocation: number;
  };
  strengths: string[];
  improvements: string[];
  jdSummary: {
    about: string;
    responsibilities: string[];
    requirements: string[];
  };
}
