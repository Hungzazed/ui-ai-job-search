"use client";

import { ArrowDown, ArrowUp, Eye, EyeSlash } from "@phosphor-icons/react/ssr";
import type { CvLayout, CvSectionKey } from "@/services";
import { SECTION_LABELS, swap } from "./cv-fields";

export function CvLayoutPanel({
  layout,
  onChange,
}: {
  layout: CvLayout;
  onChange: (value: CvLayout) => void;
}) {
  const visible = layout.order.filter((key) => !layout.hidden.includes(key));
  const hidden = layout.order.filter((key) => layout.hidden.includes(key));

  const move = (key: CvSectionKey, step: number) => {
    const at = layout.order.indexOf(key);
    onChange({ ...layout, order: swap(layout.order, at, at + step) });
  };

  const setHidden = (key: CvSectionKey, hide: boolean) =>
    onChange({
      ...layout,
      hidden: hide
        ? [...layout.hidden, key]
        : layout.hidden.filter((item) => item !== key),
    });

  return (
    <div className="space-y-4">
      <div>
        <p className="mb-2 text-xs font-semibold text-slate-700">
          Mục đang có trên CV
        </p>
        <div className="space-y-1.5">
          {visible.map((key, index) => (
            <div
              key={key}
              className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-2"
            >
              <span className="flex-1 text-sm font-medium text-slate-800">
                {SECTION_LABELS[key]}
              </span>
              <button
                type="button"
                title="Đưa lên trên"
                aria-label={`Đưa ${SECTION_LABELS[key]} lên trên`}
                disabled={index === 0}
                onClick={() => move(key, -1)}
                className="cursor-pointer rounded p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-800 disabled:cursor-default disabled:opacity-30 disabled:hover:bg-transparent"
              >
                <ArrowUp className="size-4" />
              </button>
              <button
                type="button"
                title="Đưa xuống dưới"
                aria-label={`Đưa ${SECTION_LABELS[key]} xuống dưới`}
                disabled={index === visible.length - 1}
                onClick={() => move(key, 1)}
                className="cursor-pointer rounded p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-800 disabled:cursor-default disabled:opacity-30 disabled:hover:bg-transparent"
              >
                <ArrowDown className="size-4" />
              </button>
              <button
                type="button"
                title="Ẩn khỏi CV"
                aria-label={`Ẩn ${SECTION_LABELS[key]} khỏi CV`}
                onClick={() => setHidden(key, true)}
                className="cursor-pointer rounded p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-800"
              >
                <EyeSlash className="size-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      <div>
        <p className="mb-2 text-xs font-semibold text-slate-700">
          Mục chưa dùng
        </p>
        {hidden.length === 0 ? (
          <p className="rounded-lg border border-dashed border-slate-200 px-3 py-4 text-center text-xs text-slate-400">
            Mọi mục đều đang nằm trên CV
          </p>
        ) : (
          <div className="space-y-1.5">
            {hidden.map((key) => (
              <div
                key={key}
                className="flex items-center gap-1 rounded-lg border border-dashed border-slate-200 bg-slate-50/60 px-3 py-2"
              >
                <span className="flex-1 text-sm font-medium text-slate-500">
                  {SECTION_LABELS[key]}
                </span>
                <button
                  type="button"
                  title="Đưa lại vào CV"
                  aria-label={`Đưa ${SECTION_LABELS[key]} lại vào CV`}
                  onClick={() => setHidden(key, false)}
                  className="text-primary-600 hover:text-primary-700 flex cursor-pointer items-center gap-1 rounded px-2 py-1 text-xs font-semibold hover:bg-slate-100"
                >
                  <Eye className="size-4" />
                  Đưa vào CV
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <p className="border-t border-slate-100 pt-3 text-xs text-slate-500">
        Mục bị ẩn không được vẽ ra CV, kể cả trong tầng chữ mà máy lọc hồ sơ đọc.
      </p>
    </div>
  );
}
