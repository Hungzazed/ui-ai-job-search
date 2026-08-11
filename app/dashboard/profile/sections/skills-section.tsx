"use client";

import { Sparkles } from "lucide-react";
import { ListField } from "@/components/ui/field";
import { SectionCard } from "@/components/ui/section-card";
import type { DraftFieldSpec, ProfileSectionProps } from "../profile-draft";

const FIELDS: DraftFieldSpec[] = [
  {
    key: "primarySkills",
    label: "Kỹ năng chính",
    placeholder: "React, TypeScript, Next.js",
  },
  {
    key: "secondarySkills",
    label: "Kỹ năng phụ",
    placeholder: "Node.js, PostgreSQL, Docker",
  },
  {
    key: "lackingSkills",
    label: "Kỹ năng còn thiếu",
    placeholder: "Kubernetes, Rust",
    hint: "Khai thật giúp hệ thống không đánh giá quá tay và gợi ý đúng lộ trình học",
  },
  {
    key: "directExperienceDomains",
    label: "Lĩnh vực có kinh nghiệm trực tiếp",
    placeholder: "Thương mại điện tử, Fintech",
  },
  {
    key: "adjacentExperience",
    label: "Kinh nghiệm liên quan",
    placeholder: "Logistics, SaaS B2B",
  },
];

export function SkillsSection({ draft, update }: ProfileSectionProps) {
  return (
    <SectionCard
      icon={Sparkles}
      title="Kỹ năng & lĩnh vực đã làm"
      description="Đây là dữ liệu nặng ký nhất khi chấm chiều Kỹ năng chuyên môn và Kinh nghiệm làm việc"
    >
      {FIELDS.map((field) => (
        <ListField
          key={field.key}
          id={`p-${field.key}`}
          label={field.label}
          hint={field.hint}
          placeholder={field.placeholder}
          value={draft[field.key]}
          onChange={(value) => update(field.key, value)}
        />
      ))}
    </SectionCard>
  );
}
