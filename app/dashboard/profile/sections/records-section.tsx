"use client";

import { BriefcaseBusiness, GraduationCap, Sparkles } from "lucide-react";
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
      icon={BriefcaseBusiness}
      title="Kinh nghiệm, học vấn & hành vi"
      description="Ba khối này được lưu nguyên dạng JSON và đưa thẳng vào phần chấm điểm, nên cấu trúc do bạn tự đặt miễn là JSON hợp lệ"
    >
      <JsonField
        id="p-experiences"
        label="Kinh nghiệm làm việc"
        icon={<BriefcaseBusiness className="size-3.5" />}
        placeholder={EXPERIENCE_PLACEHOLDER}
        value={draft.experiences}
        onChange={(value) => update("experiences", value)}
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
        id="p-behavioralTraits"
        label="Đặc điểm hành vi"
        icon={<Sparkles className="size-3.5" />}
        placeholder={TRAITS_PLACEHOLDER}
        value={draft.behavioralTraits}
        onChange={(value) => update("behavioralTraits", value)}
      />
    </SectionCard>
  );
}
