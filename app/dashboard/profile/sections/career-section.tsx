"use client";

import { Compass } from "lucide-react";
import { ListField } from "@/components/ui/field";
import { SectionCard } from "@/components/ui/section-card";
import type { DraftFieldSpec, ProfileSectionProps } from "../profile-draft";

const FIELDS: DraftFieldSpec[] = [
  {
    key: "careerGoals",
    label: "Mục tiêu nghề nghiệp",
    placeholder: "Lên Senior trong 2 năm, dẫn dắt một nhóm nhỏ",
  },
  {
    key: "targetSectors",
    label: "Ngành mục tiêu",
    placeholder: "Fintech, Giáo dục, Y tế",
  },
  {
    key: "energizingTasks",
    label: "Công việc tạo hứng thú",
    placeholder: "Thiết kế giao diện, tối ưu hiệu năng",
  },
  {
    key: "drainingTasks",
    label: "Công việc gây chán nản",
    placeholder: "Họp dài, sửa lỗi hệ thống cũ không tài liệu",
  },
  {
    key: "dealBreakers",
    label: "Điều không chấp nhận",
    placeholder: "Làm ngoài giờ thường xuyên, không có hợp đồng lao động",
    hint: "Tin tuyển dụng vi phạm một trong các mục này sẽ bị loại, dù điểm có cao",
  },
];

export function CareerSection({ draft, update }: ProfileSectionProps) {
  return (
    <SectionCard
      icon={Compass}
      title="Định hướng nghề nghiệp"
      description="Chiều Định hướng nghề nghiệp chiếm 30% điểm phù hợp, và điều không chấp nhận được dùng để loại thẳng tin không hợp"
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
