import type {
  AiMatchDetail,
  AiSuggestion,
  Application,
  ApplicationStatus,
  Job,
  JobSourceSlice,
  KpiMetric,
  StatSummary,
  UserProfile,
} from "@/types";

/* ----------------------------- User Profile ----------------------------- */

export const currentUser: UserProfile = {
  id: "u_001",
  name: "Nguyễn Minh An",
  title: "Frontend Engineer · 4 năm kinh nghiệm",
  email: "minhan.nguyen@gmail.com",
  location: "TP. Hồ Chí Minh",
  phone: "+84 90 123 4567",
  initials: "MA",
  summary:
    "Frontend Engineer với 4+ năm kinh nghiệm xây dựng sản phẩm web hiệu suất cao bằng React, TypeScript và Next.js. Đam mê UI engineering, performance và hệ thống thiết kế.",
  profileCompletion: 86,
  skills: [
    { name: "React", level: "expert" },
    { name: "TypeScript", level: "expert" },
    { name: "Next.js", level: "advanced" },
    { name: "Tailwind CSS", level: "advanced" },
    { name: "Node.js", level: "intermediate" },
    { name: "GraphQL", level: "intermediate" },
    { name: "Testing (Jest, Playwright)", level: "advanced" },
    { name: "System Design", level: "beginner" },
  ],
  experiences: [
    {
      id: "exp_1",
      company: "TechCorp Vietnam",
      position: "Senior Frontend Engineer",
      period: "03/2023 – Hiện tại",
      location: "TP. Hồ Chí Minh",
      highlights: [
        "Dẫn dắt nhóm 5 dev phát triển design system nội bộ phục vụ 12 sản phẩm.",
        "Giảm 45% thời gian load trang chính bằng code-splitting và caching.",
        "Triển khai CI/CD và tăng test coverage lên 85%.",
      ],
    },
    {
      id: "exp_2",
      company: "SoftBank Cloud",
      position: "Frontend Engineer",
      period: "06/2021 – 02/2023",
      location: "Hà Nội",
      highlights: [
        "Xây dựng dashboard real-time phục vụ 500k+ người dùng.",
        "Chuyển đổi codebase từ React Class Component sang Hooks + TypeScript.",
      ],
    },
    {
      id: "exp_3",
      company: "StartupHub",
      position: "Web Developer",
      period: "07/2020 – 05/2021",
      location: "Hà Nội",
      highlights: ["Phát triển 8 landing page + 2 e-commerce website cho khách hàng."],
    },
  ],
  projects: [
    {
      id: "prj_1",
      name: "AI Job Matching Platform",
      description:
        "Nền tảng kết nối ứng viên với việc làm dùng AI scoring. Chịu trách nhiệm toàn bộ UI/UX, real-time notifications và dashboard analytics.",
      technologies: ["Next.js", "TypeScript", "Tailwind CSS", "WebSocket"],
      period: "2024",
    },
    {
      id: "prj_2",
      name: "E-commerce Microfrontend",
      description:
        "Hệ thống cửa hàng trực tuyến modular với module federation, hỗ trợ 3 teams phát triển song song.",
      technologies: ["React", "Module Federation", "Vite", "Redis"],
      period: "2023",
    },
  ],
  educations: [
    {
      id: "edu_1",
      school: "Đại học Bách Khoa Hà Nội",
      degree: "Kỹ sư",
      field: "Khoa học Máy tính",
      period: "2016 – 2020",
      gpa: "3.4/4.0",
    },
  ],
  certificates: [
    { id: "cer_1", name: "AWS Certified Developer – Associate", issuer: "Amazon Web Services", year: "2024" },
    { id: "cer_2", name: "Meta Front-End Developer Professional", issuer: "Meta / Coursera", year: "2023" },
  ],
  activities: [
    {
      id: "act_1",
      title: "Speaker — Frontend Vietnam Meetup",
      description: "Chia sẻ chủ đề 'Performance Budget trong thực tế'.",
      date: "05/2025",
    },
    {
      id: "act_2",
      title: "Mentor — React Bootcamp",
      description: "Hướng dẫn 20 học viên hoàn thành capstone project.",
      date: "2024",
    },
  ],
  connections: [
    { id: "con_1", type: "cv", label: "CV PDF", status: "connected", detail: "ai-career-agent-cv.pdf · Cập nhật 2 tuần trước" },
    { id: "con_2", type: "github", label: "GitHub", status: "connected", detail: "@minhan-nguyen · 68 repos công khai" },
    { id: "con_3", type: "linkedin", label: "LinkedIn", status: "not_connected", detail: "Kết nối để đồng bộ kinh nghiệm & mạng lưới" },
    { id: "con_4", type: "manual", label: "Nhập thủ công", status: "connected", detail: "Kỹ năng & dự án được AI gợi ý bổ sung" },
  ],
};

/* -------------------------------- Jobs ---------------------------------- */

export const jobs: Job[] = [
  {
    id: "job_1",
    company: "FPT Software",
    companyInitials: "FS",
    companyColor: "bg-orange-500",
    title: "Senior Frontend Engineer (React/Next.js)",
    location: "TP. Hồ Chí Minh · Hybrid",
    salary: { min: 35, max: 55, currency: "VND", period: "month" },
    tags: ["React", "Next.js", "TypeScript", "Tailwind CSS"],
    postedAt: "2026-07-25",
    aiMatch: 92,
    saved: true,
  },
  {
    id: "job_2",
    company: "VNG Corporation",
    companyInitials: "VNG",
    companyColor: "bg-sky-600",
    title: "Frontend Engineer — Design System",
    location: "TP. Hồ Chí Minh · Onsite",
    salary: { min: 30, max: 45, currency: "VND", period: "month" },
    tags: ["React", "Storybook", "Figma", "Accessibility"],
    postedAt: "2026-07-22",
    aiMatch: 87,
    saved: false,
  },
  {
    id: "job_3",
    company: "Shopee",
    companyInitials: "SP",
    companyColor: "bg-orange-400",
    title: "Senior Web UI Engineer",
    location: "Hà Nội · Hybrid",
    salary: { min: 2000, max: 3000, currency: "USD", period: "month" },
    tags: ["TypeScript", "Web Performance", "GraphQL"],
    postedAt: "2026-07-20",
    aiMatch: 81,
    saved: false,
  },
  {
    id: "job_4",
    company: "Momo",
    companyInitials: "MM",
    companyColor: "bg-rose-500",
    title: "React Native / Web Engineer",
    location: "TP. Hồ Chí Minh · Onsite",
    salary: { min: 28, max: 42, currency: "VND", period: "month" },
    tags: ["React Native", "TypeScript", "Redux"],
    postedAt: "2026-07-18",
    aiMatch: 68,
    saved: false,
  },
  {
    id: "job_5",
    company: "Katalon",
    companyInitials: "KT",
    companyColor: "bg-primary-600",
    title: "Frontend Engineer (Next.js)",
    location: "Remote (Việt Nam)",
    salary: { min: 32, max: 48, currency: "VND", period: "month" },
    tags: ["Next.js", "Node.js", "Tailwind CSS"],
    postedAt: "2026-07-15",
    aiMatch: 74,
    saved: false,
  },
];

export const jobDetail: Record<string, AiMatchDetail> = {
  job_1: {
    overall: 92,
    criteria: { skills: 95, experience: 90, projects: 88, level: 94, salaryLocation: 92 },
    strengths: [
      "Kinh nghiệm 4 năm React/TypeScript khớp 100% yêu cầu vị trí Senior.",
      "Đã từng dẫn dắt design system — trùng với trách nhiệm chính của JD.",
      "Kỹ năng Next.js + Performance Optimization được đánh giá expert.",
      "Chứng chỉ AWS bổ trợ cho phần tích hợp CI/CD trong team.",
    ],
    improvements: [
      "JD yêu cầu GraphQL server (Apollo) — bạn mới ở mức intermediate.",
      "Thiếu kinh nghiệm quản lý nhóm (2+ member) trong 1 năm gần nhất.",
      "Nên thêm số liệu cụ thể (KPI) cho dự án AI Job Matching.",
    ],
    jdSummary: {
      about:
        "FPT Software đang tìm Senior Frontend Engineer gia nhập Global Delivery Center, làm việc với khách hàng quốc tế về các dự án SaaS quy mô lớn.",
      responsibilities: [
        "Phát triển & duy trì ứng dụng React/Next.js phục vụ triệu người dùng.",
        "Thiết kế kiến trúc frontend và chuẩn hóa codebase chung cho team.",
        "Hợp tác với design team để xây dựng design system & component library.",
        "Tối ưu hiệu suất (Core Web Vitals) và giám sát chất lượng bằng CI.",
      ],
      requirements: [
        "4+ năm kinh nghiệm React, thành thạo TypeScript & Next.js App Router.",
        "Kinh nghiệm GraphQL (Apollo Client) và unit/integration testing.",
        "Hiểu biết sâu về performance optimization và accessibility.",
        "Ưu tiên ứng viên có kinh nghiệm mentoring hoặc lead nhóm 3–5 người.",
      ],
    },
  },
  job_2: {
    overall: 87,
    criteria: { skills: 88, experience: 84, projects: 85, level: 90, salaryLocation: 86 },
    strengths: [
      "Kinh nghiệm xây dựng design system tại TechCorp rất phù hợp.",
      "Thành thạo Storybook & testing toolchain (Jest, Playwright).",
    ],
    improvements: [
      "JD yêu cầu Figma design tokens workflow — cần bổ sung vào CV.",
      "Nên làm rõ số lượng component đã ship trong design system.",
    ],
    jdSummary: {
      about:
        "VNG tìm Frontend Engineer tập trung vào design system để phục vụ hệ sinh thái sản phẩm game, cloud và fintech.",
      responsibilities: [
        "Xây dựng và vận hành component library dùng chung cho toàn công ty.",
        "Đảm bảo accessibility (WCAG 2.1) và hỗ trợ các team tích hợp.",
      ],
      requirements: [
        "Kinh nghiệm thiết kế token system trên Figma.",
        "Thành thạo React + Storybook, quen với versioning package.",
      ],
    },
  },
};

export const defaultMatchDetail: AiMatchDetail = {
  overall: 0,
  criteria: { skills: 0, experience: 0, projects: 0, level: 0, salaryLocation: 0 },
  strengths: [],
  improvements: [],
  jdSummary: { about: "", responsibilities: [], requirements: [] },
};

/* ---------------------------- Applications ------------------------------ */

export const applications: Application[] = [
  { id: "app_1", jobTitle: "Senior Frontend Engineer (React/Next.js)", company: "FPT Software", companyInitials: "FS", companyColor: "bg-orange-500", appliedAt: "2026-07-27", status: "reviewing", matchScore: 92, note: "Được AI cá nhân hóa CV trước khi nộp" },
  { id: "app_2", jobTitle: "Frontend Engineer — Design System", company: "VNG Corporation", companyInitials: "VNG", companyColor: "bg-sky-600", appliedAt: "2026-07-24", status: "interview", matchScore: 87, note: "Vòng 1: Technical Interview — 02/08" },
  { id: "app_3", jobTitle: "Senior Web UI Engineer", company: "Shopee", companyInitials: "SP", companyColor: "bg-orange-400", appliedAt: "2026-07-21", status: "submitted", matchScore: 81 },
  { id: "app_4", jobTitle: "React Native / Web Engineer", company: "Momo", companyInitials: "MM", companyColor: "bg-rose-500", appliedAt: "2026-07-15", status: "rejected", matchScore: 68, note: "Không đạt vòng CV screening" },
  { id: "app_5", jobTitle: "Frontend Engineer (Next.js)", company: "Katalon", companyInitials: "KT", companyColor: "bg-primary-600", appliedAt: "2026-07-10", status: "offered", matchScore: 74, note: "Offer: 40 triệu + 13 tháng lương" },
  { id: "app_6", jobTitle: "Fullstack Engineer (Node.js)", company: "Techcombank", companyInitials: "TCB", companyColor: "bg-emerald-600", appliedAt: "2026-06-28", status: "submitted", matchScore: 71 },
  { id: "app_7", jobTitle: "UI Engineer", company: "Sendo", companyInitials: "SD", companyColor: "bg-cyan-500", appliedAt: "2026-06-15", status: "rejected", matchScore: 58 },
];

export const applicationStatusLabels: Record<ApplicationStatus, string> = {
  submitted: "Đã nộp",
  reviewing: "Đang xem xét",
  interview: "Đã phỏng vấn",
  rejected: "Từ chối",
  offered: "Nhận việc",
};

/* ------------------------------ Summary --------------------------------- */

export const statSummary: StatSummary = {
  profileCompletion: currentUser.profileCompletion,
  matchingJobsCount: 24,
  applicationsCount: 7,
  avgMatchRate: 76,
  weeklyApplications: 3,
};

/* ---------------------------- AI Suggestions ---------------------------- */

export const aiSuggestions: AiSuggestion[] = [
  {
    id: "sg_1",
    type: "cv",
    title: "Thêm KPI vào mục Kinh nghiệm",
    description:
      "Thêm số liệu cụ thể (VD: 'giảm 45% thời gian load') giúp tăng trung bình 12 điểm match.",
  },
  {
    id: "sg_2",
    type: "skill",
    title: "Học GraphQL cấp độ intermediate",
    description:
      "3/24 việc làm phù hợp nhất đều yêu cầu Apollo — bổ sung sẽ mở thêm ~18% cơ hội.",
  },
  {
    id: "sg_3",
    type: "network",
    title: "Kết nối LinkedIn để tăng độ tin cậy",
    description:
      "Nhà tuyển dụng xem hồ sơ có LinkedIn verified cao hơn 2.1 lần so với thường.",
  },
  {
    id: "sg_4",
    type: "apply",
    title: "FPT Software đang tuyển gấp",
    description:
      "JD mới nhất đạt 92% match với hồ sơ của bạn — nên ứng tuyển trong 48h tới.",
  },
];

/* -------------------------------- Admin --------------------------------- */

export const adminKpis: KpiMetric[] = [
  { label: "Tổng người dùng", value: "12,480", change: "+8.2% so với tháng trước", trend: "up" },
  { label: "Jobs đã thu thập", value: "45,320", change: "+1,204 trong 7 ngày", trend: "up" },
  { label: "Ứng tuyển thành công", value: "8,912", change: "+12.5% so với tháng trước", trend: "up" },
  { label: "AI Requests", value: "1.2M", change: "-3.1% so với tháng trước", trend: "down" },
];

export const activityData: { date: string; users: number; applications: number; aiRequests: number }[] = [
  { date: "19/07", users: 320, applications: 148, aiRequests: 2800 },
  { date: "20/07", users: 355, applications: 162, aiRequests: 3100 },
  { date: "21/07", users: 380, applications: 171, aiRequests: 3350 },
  { date: "22/07", users: 342, applications: 155, aiRequests: 2950 },
  { date: "23/07", users: 418, applications: 198, aiRequests: 3800 },
  { date: "24/07", users: 445, applications: 214, aiRequests: 4120 },
  { date: "25/07", users: 402, applications: 187, aiRequests: 3560 },
];

export const jobSources: JobSourceSlice[] = [
  { name: "Tự động crawl", value: 52, color: "#7c3aed" },
  { name: "Nguồn tuyển dụng (ATS)", value: 28, color: "#6366f1" },
  { name: "Nhà tuyển dụng đăng", value: 14, color: "#22c55e" },
  { name: "Thủ công / API", value: 6, color: "#f59e0b" },
];
