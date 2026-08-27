"use client";

import {
  Briefcase,
  GitBranch,
  GraduationCap,
  Medal,
  Sparkle,
} from "@phosphor-icons/react/ssr";
import { JsonField } from "@/components/ui/field";
import { SectionCard } from "@/components/ui/section-card";
import type { ProfileSectionProps } from "../profile-draft";

const EXPERIENCE_PLACEHOLDER = `[
  {
    "company": "Công ty ABC",
    "position": "Frontend Engineer",
    "period": "2022 - nay",
    "highlights": ["Giảm thời gian tải trang 40%"]
  }
]`;

const PROJECT_PLACEHOLDER = `[
  {
    "name": "Cổng tra cứu hóa đơn",
    "period": "2025 - nay",
    "description": "Nền tảng thu thập và bóc tách hóa đơn điện tử, xử lý 3.000 hóa đơn mỗi tháng.",
    "technologies": ["NestJS", "PostgreSQL", "OCR"]
  }
]`;

const CERTIFICATE_PLACEHOLDER = `[
  {
    "name": "AWS Certified Solutions Architect",
    "issuer": "Amazon Web Services",
    "year": "2025"
  }
]`;

const EDUCATION_PLACEHOLDER = `[
  {
    "school": "Đại học Bách khoa",
    "degree": "Kỹ sư",
    "field": "Khoa học máy tính",
    "period": "2016 - 2020"
  }
]`;

const TRAITS_PLACEHOLDER = `{
  "workStyle": "Chủ động, thích tự chịu trách nhiệm",
  "teamPreference": "Nhóm nhỏ dưới 8 người"
}`;

export function RecordsSection({ draft, update }: ProfileSectionProps) {
  return (
    <SectionCard
      icon={Briefcase}
      title="Kinh nghiệm, dự án & học vấn"
      description="Các khối này được lưu nguyên dạng JSON và đưa thẳng vào phần chấm điểm cùng mọi tài liệu AI viết ra, nên cấu trúc do bạn tự đặt miễn là JSON hợp lệ"
    >
      {/* Hai ô này cao hơn ba ô còn lại: một mục kinh nghiệm hay dự án chiếm
          12-14 dòng JSON, nên ở mức 8 dòng mặc định thì không xem trọn nổi một
          mục mà không cuộn. Học vấn và chứng chỉ thì 4-5 dòng là hết. */}
      <JsonField
        id="p-experiences"
        label="Kinh nghiệm làm việc"
        icon={<Briefcase className="size-3.5" />}
        placeholder={EXPERIENCE_PLACEHOLDER}
        value={draft.experiences}
        onChange={(value) => update("experiences", value)}
        rows={14}
      />
      {/* Dự án đứng NGAY SAU kinh nghiệm chứ không nằm cuối: với hồ sơ kỹ
          thuật, đây thường là phần chứng minh năng lực mạnh nhất, và nó được
          nhồi vào prompt ngang hàng với kinh nghiệm làm việc. */}
      <JsonField
        id="p-projects"
        label="Dự án"
        icon={<GitBranch className="size-3.5" />}
        placeholder={PROJECT_PLACEHOLDER}
        value={draft.projects}
        onChange={(value) => update("projects", value)}
        rows={14}
      />
      <JsonField
        id="p-educations"
        label="Học vấn"
        icon={<GraduationCap className="size-3.5" />}
        placeholder={EDUCATION_PLACEHOLDER}
        value={draft.educations}
        onChange={(value) => update("educations", value)}
      />
      <JsonField
        id="p-certificates"
        label="Chứng chỉ"
        icon={<Medal className="size-3.5" />}
        placeholder={CERTIFICATE_PLACEHOLDER}
        value={draft.certificates}
        onChange={(value) => update("certificates", value)}
      />
      <JsonField
        id="p-behavioralTraits"
        label="Đặc điểm hành vi"
        icon={<Sparkle className="size-3.5" />}
        placeholder={TRAITS_PLACEHOLDER}
        value={draft.behavioralTraits}
        onChange={(value) => update("behavioralTraits", value)}
      />
    </SectionCard>
  );
}
