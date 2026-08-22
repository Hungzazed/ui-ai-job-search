"use client";

import { ChevronDown, ChevronUp, Eye, EyeOff, Plus, X } from "lucide-react";
import type {
  CvContentInput,
  CvLayout,
  CvSectionKey,
} from "@/services";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/form";

/** Tên mục hiện cho người dùng. Phải khớp `SECTION_TITLES` phía backend. */
const SECTION_LABELS: Record<CvSectionKey, string> = {
  profile: "Giới thiệu",
  competencies: "Năng lực chính",
  experience: "Kinh nghiệm",
  education: "Học vấn",
  skills: "Kỹ năng",
};

/** Đổi một phần tử trong mảng mà không sửa mảng gốc. */
const replaceAt = <T,>(list: T[], index: number, value: T): T[] =>
  list.map((item, at) => (at === index ? value : item));

/** Đổi chỗ hai phần tử. Trả về chính mảng cũ nếu chỉ số nằm ngoài. */
const swap = <T,>(list: T[], from: number, to: number): T[] => {
  if (to < 0 || to >= list.length) return list;
  const next = [...list];
  [next[from], next[to]] = [next[to], next[from]];
  return next;
};

/** Ô nhập nhiều dòng, mỗi dòng một mục. Dùng cho gạch đầu dòng vốn hay có dấu phẩy. */
function LinesField({
  label,
  value,
  rows = 3,
  onChange,
}: {
  label: string;
  value: string[];
  rows?: number;
  onChange: (value: string[]) => void;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-slate-600">
        {label} <span className="text-slate-400">· mỗi dòng một ý</span>
      </span>
      <Textarea
        rows={rows}
        value={value.join("\n")}
        onChange={(event) =>
          onChange(
            event.target.value
              .split("\n")
              .map((line) => line.trim())
              .filter(Boolean),
          )
        }
      />
    </label>
  );
}

/** Ô nhập một dòng kèm nhãn nhỏ. */
function Line({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-slate-600">
        {label}
      </span>
      <Input value={value} onChange={(event) => onChange(event.target.value)} />
    </label>
  );
}

/** Khung một mục con, kèm nút xoá ở góc. */
function EntryBox({
  onRemove,
  children,
}: {
  onRemove: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="relative space-y-2 rounded-lg border border-slate-200 bg-slate-50/60 p-3">
      <button
        type="button"
        onClick={onRemove}
        aria-label="Xoá mục này"
        className="absolute right-2 top-2 rounded p-1 text-slate-400 hover:bg-slate-200 hover:text-slate-700"
      >
        <X className="size-3.5" />
      </button>
      {children}
    </div>
  );
}

/**
 * Panel sửa nội dung CV: chữ, thứ tự mục, mục bị ẩn.
 *
 * Component ĐƯỢC ĐIỀU KHIỂN - không giữ state riêng. Nhờ vậy khung xem trước và
 * nút Lưu ở component cha luôn nhìn thấy đúng một bản nháp duy nhất.
 */
export function CvEditor({
  content,
  layout,
  onContentChange,
  onLayoutChange,
}: {
  content: CvContentInput;
  layout: CvLayout;
  onContentChange: (value: CvContentInput) => void;
  onLayoutChange: (value: CvLayout) => void;
}) {
  const move = (index: number, step: number) =>
    onLayoutChange({ ...layout, order: swap(layout.order, index, index + step) });

  const toggleHidden = (key: CvSectionKey) =>
    onLayoutChange({
      ...layout,
      hidden: layout.hidden.includes(key)
        ? layout.hidden.filter((item) => item !== key)
        : [...layout.hidden, key],
    });

  return (
    <div className="space-y-3">
      {layout.order.map((key, index) => {
        const hidden = layout.hidden.includes(key);
        return (
          <section
            key={key}
            className={
              "rounded-lg border border-slate-200 p-3 " +
              (hidden ? "bg-slate-50 opacity-60" : "bg-white")
            }
          >
            <header className="mb-2 flex items-center gap-1">
              <h3 className="flex-1 text-sm font-semibold text-slate-800">
                {SECTION_LABELS[key]}
              </h3>
              <button
                type="button"
                aria-label={hidden ? "Hiện mục này" : "Ẩn mục này"}
                onClick={() => toggleHidden(key)}
                className="rounded p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-800"
              >
                {hidden ? (
                  <EyeOff className="size-4" />
                ) : (
                  <Eye className="size-4" />
                )}
              </button>
              <button
                type="button"
                aria-label="Đưa lên trên"
                disabled={index === 0}
                onClick={() => move(index, -1)}
                className="rounded p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-800 disabled:opacity-30 disabled:hover:bg-transparent"
              >
                <ChevronUp className="size-4" />
              </button>
              <button
                type="button"
                aria-label="Đưa xuống dưới"
                disabled={index === layout.order.length - 1}
                onClick={() => move(index, 1)}
                className="rounded p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-800 disabled:opacity-30 disabled:hover:bg-transparent"
              >
                <ChevronDown className="size-4" />
              </button>
            </header>

            {!hidden && (
              <SectionFields
                sectionKey={key}
                content={content}
                onChange={onContentChange}
              />
            )}
          </section>
        );
      })}
    </div>
  );
}

/** Các ô nhập của đúng một mục. */
function SectionFields({
  sectionKey,
  content,
  onChange,
}: {
  sectionKey: CvSectionKey;
  content: CvContentInput;
  onChange: (value: CvContentInput) => void;
}) {
  if (sectionKey === "profile") {
    return (
      <Textarea
        rows={8}
        value={content.profileStatement}
        placeholder="Vài câu giới thiệu bản thân"
        onChange={(event) =>
          onChange({ ...content, profileStatement: event.target.value })
        }
      />
    );
  }

  if (sectionKey === "competencies") {
    return (
      <LinesField
        label="Năng lực"
        rows={5}
        value={content.coreCompetencies}
        onChange={(coreCompetencies) => onChange({ ...content, coreCompetencies })}
      />
    );
  }

  if (sectionKey === "experience") {
    const list = content.experiences;
    const update = (experiences: CvContentInput["experiences"]) =>
      onChange({ ...content, experiences });

    return (
      <div className="space-y-2">
        {list.map((experience, index) => (
          <EntryBox
            key={index}
            onRemove={() => update(list.filter((_, at) => at !== index))}
          >
            <Line
              label="Chức danh"
              value={experience.position}
              onChange={(position) =>
                update(replaceAt(list, index, { ...experience, position }))
              }
            />
            <div className="grid gap-2 sm:grid-cols-2">
              <Line
                label="Công ty"
                value={experience.company}
                onChange={(company) =>
                  update(replaceAt(list, index, { ...experience, company }))
                }
              />
              <Line
                label="Nơi làm"
                value={experience.location}
                onChange={(location) =>
                  update(replaceAt(list, index, { ...experience, location }))
                }
              />
            </div>
            <Line
              label="Thời gian"
              value={experience.period}
              onChange={(period) =>
                update(replaceAt(list, index, { ...experience, period }))
              }
            />
            <LinesField
              label="Việc đã làm"
              rows={8}
              value={experience.bullets}
              onChange={(bullets) =>
                update(replaceAt(list, index, { ...experience, bullets }))
              }
            />
          </EntryBox>
        ))}
        <AddButton
          label="Thêm kinh nghiệm"
          onClick={() =>
            update([
              ...list,
              {
                position: "",
                company: "",
                location: "",
                period: "",
                bullets: [],
              },
            ])
          }
        />
      </div>
    );
  }

  if (sectionKey === "education") {
    const list = content.educations;
    const update = (educations: CvContentInput["educations"]) =>
      onChange({ ...content, educations });

    return (
      <div className="space-y-2">
        {list.map((education, index) => (
          <EntryBox
            key={index}
            onRemove={() => update(list.filter((_, at) => at !== index))}
          >
            <Line
              label="Bằng cấp"
              value={education.degree}
              onChange={(degree) =>
                update(replaceAt(list, index, { ...education, degree }))
              }
            />
            <div className="grid gap-2 sm:grid-cols-2">
              <Line
                label="Trường"
                value={education.institution}
                onChange={(institution) =>
                  update(replaceAt(list, index, { ...education, institution }))
                }
              />
              <Line
                label="Thời gian"
                value={education.period}
                onChange={(period) =>
                  update(replaceAt(list, index, { ...education, period }))
                }
              />
            </div>
            <Line
              label="Ghi chú"
              value={education.detail}
              onChange={(detail) =>
                update(replaceAt(list, index, { ...education, detail }))
              }
            />
          </EntryBox>
        ))}
        <AddButton
          label="Thêm học vấn"
          onClick={() =>
            update([
              ...list,
              { degree: "", institution: "", period: "", detail: "" },
            ])
          }
        />
      </div>
    );
  }

  const list = content.skillGroups;
  const update = (skillGroups: CvContentInput["skillGroups"]) =>
    onChange({ ...content, skillGroups });

  return (
    <div className="space-y-2">
      {list.map((group, index) => (
        <EntryBox
          key={index}
          onRemove={() => update(list.filter((_, at) => at !== index))}
        >
          <Line
            label="Nhóm"
            value={group.label}
            onChange={(label) =>
              update(replaceAt(list, index, { ...group, label }))
            }
          />
          <LinesField
            label="Kỹ năng"
            value={group.items}
            onChange={(items) =>
              update(replaceAt(list, index, { ...group, items }))
            }
          />
        </EntryBox>
      ))}
      <AddButton
        label="Thêm nhóm kỹ năng"
        onClick={() => update([...list, { label: "", items: [] }])}
      />
    </div>
  );
}

/** Nút thêm một mục con. */
function AddButton({
  label,
  onClick,
}: {
  label: string;
  onClick: () => void;
}) {
  return (
    <Button size="sm" variant="outline" onClick={onClick} className="w-full">
      <Plus className="size-4" />
      {label}
    </Button>
  );
}
