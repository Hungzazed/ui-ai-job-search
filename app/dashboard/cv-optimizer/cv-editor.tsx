"use client";

import { SECTION_LABELS, swap } from "./cv-fields";
import { SectionFields } from "./section-fields";
import { CaretDown, CaretUp, Eye, EyeSlash } from "@phosphor-icons/react/ssr";
import type {
  CvContentInput,
  CvLayout,
  CvSectionKey,
} from "@/services";

/** Tên mục hiện cho người dùng. Phải khớp `SECTION_TITLES` phía backend. */
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
                  <EyeSlash className="size-4.5" />
                ) : (
                  <Eye className="size-4.5" />
                )}
              </button>
              <button
                type="button"
                aria-label="Đưa lên trên"
                disabled={index === 0}
                onClick={() => move(index, -1)}
                className="rounded p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-800 disabled:opacity-30 disabled:hover:bg-transparent"
              >
                <CaretUp className="size-4.5" />
              </button>
              <button
                type="button"
                aria-label="Đưa xuống dưới"
                disabled={index === layout.order.length - 1}
                onClick={() => move(index, 1)}
                className="rounded p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-800 disabled:opacity-30 disabled:hover:bg-transparent"
              >
                <CaretDown className="size-4.5" />
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
