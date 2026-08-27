"use client";

import { CaretRight } from "@phosphor-icons/react/ssr";
import type { CvContentInput, CvLayout, CvSectionKey } from "@/services";
import { cn } from "@/utils";
import { SECTION_LABELS } from "./cv-fields";
import { SectionFields } from "./section-fields";

function entryCount(
  key: CvSectionKey,
  content: CvContentInput,
): string | null {
  switch (key) {
    case "profile":
      return null;
    case "competencies":
      return `${content.coreCompetencies.length} ý`;
    case "experience":
      return String(content.experiences.length);
    case "projects":
      return String(content.projects.length);
    case "education":
      return String(content.educations.length);
    case "skills":
      return String(content.skillGroups.length);
  }
}

export function CvEditor({
  content,
  layout,
  openKey,
  onOpenKeyChange,
  onContentChange,
}: {
  content: CvContentInput;
  layout: CvLayout;
  openKey: CvSectionKey | null;
  onOpenKeyChange: (key: CvSectionKey | null) => void;
  onContentChange: (value: CvContentInput) => void;
}) {
  const visible = layout.order.filter((key) => !layout.hidden.includes(key));

  return (
    <div className="space-y-2">
      {visible.map((key) => {
        const open = openKey === key;
        const count = entryCount(key, content);

        return (
          <section
            key={key}
            className={cn(
              "rounded-lg border transition-colors",
              open
                ? "border-primary-300 bg-white shadow-xs"
                : "border-slate-200 bg-white hover:border-slate-300",
            )}
          >
            <button
              type="button"
              onClick={() => onOpenKeyChange(open ? null : key)}
              aria-expanded={open}
              className="flex w-full cursor-pointer items-center gap-2 px-3 py-2.5 text-left"
            >
              <CaretRight
                className={cn(
                  "size-4 shrink-0 text-slate-400 transition-transform",
                  open && "rotate-90",
                )}
              />
              <span className="text-sm font-semibold text-slate-800">
                {SECTION_LABELS[key]}
              </span>
              {count && (
                <span className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-2xs text-slate-500">
                  {count}
                </span>
              )}
            </button>

            {open && (
              <div className="px-3 pb-3">
                <SectionFields
                  sectionKey={key}
                  content={content}
                  onChange={onContentChange}
                />
              </div>
            )}
          </section>
        );
      })}

      {layout.hidden.length > 0 && (
        <p className="pt-1 text-xs text-slate-500">
          {layout.hidden.length} mục đang ẩn khỏi CV — mở tab{" "}
          <span className="font-semibold text-slate-700">Bố cục</span> để bật lại.
        </p>
      )}
    </div>
  );
}
