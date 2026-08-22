"use client";

import { useMemo } from "react";
import { documentsService, type CvTemplate } from "@/services";
import { useApiQuery } from "@/hooks/use-api-query";
import { keys } from "@/lib/query-keys";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

/** Màu gợi ý cho mẫu có dùng màu nhấn. */
const ACCENT_CHOICES = [
  "#3873b3",
  "#0f766e",
  "#b45309",
  "#1f3864",
  "#334155",
  "#9d174d",
] as const;

const STYLE_LABELS: Record<CvTemplate["style"], string> = {
  "don-gian": "Đơn giản",
  "chuyen-nghiep": "Chuyên nghiệp",
  "hien-dai": "Hiện đại",
};

/**
 * Kho chọn mẫu CV. Component ĐƯỢC ĐIỀU KHIỂN: bản nháp và khung xem trước do
 * `CvStudio` giữ, ở đây chỉ báo lên khi người dùng chọn.
 */
export function CvTemplatePicker({
  templateId,
  accent,
  onTemplateChange,
  onAccentChange,
}: {
  templateId: string;
  accent?: string;
  onTemplateChange: (templateId: string) => void;
  onAccentChange: (accent: string) => void;
}) {
  // Danh sách mẫu gần như bất biến - sáu mục do máy chủ khai cứng. Trước đây
  // mỗi lần mở kho mẫu là một request cho đúng sáu dòng đó.
  const { data: templates, error } = useApiQuery(
    keys.cvTemplates(),
    () => documentsService.cvTemplates(),
    { errorMessage: "Không tải được danh sách mẫu", staleTime: Infinity },
  );

  const selected = useMemo(
    () => templates?.find((template) => template.id === templateId) ?? null,
    [templates, templateId],
  );

  if (error) return <Alert tone="danger">{error}</Alert>;

  if (!templates) {
    return (
      <div className="grid grid-cols-2 gap-2.5">
        {Array.from({ length: 6 }, (_, index) => (
          <Skeleton key={index} className="h-20" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <ul className="grid grid-cols-2 gap-2.5">
        {templates.map((template) => (
          <li key={template.id}>
            <TemplateCard
              template={template}
              active={template.id === templateId}
              onSelect={() => onTemplateChange(template.id)}
            />
          </li>
        ))}
      </ul>

      {selected?.usesAccent ? (
        <div className="space-y-2">
          <p className="text-xs font-medium text-slate-600">Màu nhấn</p>
          <div className="flex flex-wrap gap-2">
            {ACCENT_CHOICES.map((choice) => (
              <button
                key={choice}
                type="button"
                aria-label={`Màu ${choice}`}
                aria-pressed={(accent ?? selected.accent) === choice}
                onClick={() => onAccentChange(choice)}
                className={
                  "size-7 rounded-full border-2 transition " +
                  ((accent ?? selected.accent) === choice
                    ? "border-slate-900"
                    : "border-transparent hover:border-slate-300")
                }
                style={{ backgroundColor: choice }}
              />
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}

/** Một ô mẫu trong lưới chọn. */
function TemplateCard({
  template,
  active,
  onSelect,
}: {
  template: CvTemplate;
  active: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={active}
      className={
        "w-full rounded-lg border p-2.5 text-left transition " +
        (active
          ? "border-primary-500 bg-primary-50/60 ring-1 ring-primary-500"
          : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50")
      }
    >
      <div className="flex items-center gap-2">
        <span
          className="size-3 shrink-0 rounded-full"
          style={{ backgroundColor: template.accent }}
        />
        <span className="truncate text-sm font-medium text-slate-800">
          {template.name}
        </span>
      </div>
      <p className="mt-1 line-clamp-2 text-xs leading-snug text-slate-500">
        {template.description}
      </p>
      <Badge className="mt-1.5" variant="neutral">
        {STYLE_LABELS[template.style]}
      </Badge>
    </button>
  );
}
