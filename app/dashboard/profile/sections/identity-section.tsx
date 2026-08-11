"use client";

import { IdCard } from "lucide-react";
import { AreaField, ListField, TextField } from "@/components/ui/field";
import { SectionCard } from "@/components/ui/section-card";
import type { ProfileSectionProps } from "../profile-draft";

const TEXT_FIELDS = [
  {
    key: "headline",
    label: "Chức danh",
    placeholder: "Frontend Engineer",
  },
  {
    key: "employmentStatus",
    label: "Tình trạng hiện tại",
    placeholder: "Đang đi làm / Đang tìm việc",
  },
  {
    key: "location",
    label: "Địa điểm",
    placeholder: "Thành phố Hồ Chí Minh",
  },
  { key: "country", label: "Quốc gia", placeholder: "Việt Nam" },
  { key: "citizenship", label: "Quốc tịch", placeholder: "Việt Nam" },
  {
    key: "workPermit",
    label: "Giấy phép lao động",
    placeholder: "Không cần / Đã có / Cần bảo lãnh",
  },
] as const;

export function IdentitySection({ draft, update }: ProfileSectionProps) {
  return (
    <SectionCard
      icon={IdCard}
      title="Định danh & điều kiện ứng tuyển"
      description="Quốc tịch và giấy phép lao động quyết định một tin tuyển dụng có được coi là đủ điều kiện ứng tuyển hay không"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        {TEXT_FIELDS.map((field) => (
          <TextField
            key={field.key}
            id={`p-${field.key}`}
            label={field.label}
            placeholder={field.placeholder}
            value={draft[field.key]}
            onChange={(value) => update(field.key, value)}
          />
        ))}
      </div>
      <ListField
        id="p-languages"
        label="Ngôn ngữ"
        placeholder="Tiếng Việt, Tiếng Anh"
        value={draft.languages}
        onChange={(value) => update("languages", value)}
      />
      <AreaField
        id="p-summary"
        label="Giới thiệu bản thân"
        rows={5}
        placeholder="Vài dòng về kinh nghiệm, thế mạnh và điều bạn đang tìm kiếm"
        value={draft.summary}
        onChange={(value) => update("summary", value)}
      />
    </SectionCard>
  );
}
