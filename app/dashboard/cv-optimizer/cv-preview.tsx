"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { CvSectionKey } from "@/services";
import { Skeleton } from "@/components/ui/skeleton";

/** Khổ A4 quy ra pixel ở 96dpi, đúng mốc trình duyệt dùng để dựng trang. */
const PAGE_WIDTH = 794;
const PAGE_HEIGHT = 1123;

/** Số trang khung xem trước cuộn được. CV dài hơn thì bản PDF vẫn đủ. */
const PREVIEW_PAGES = 2;

/**
 * Khung xem trước, thu nhỏ đúng tỉ lệ A4.
 *
 * Phải THU NHỎ chứ không thả iframe co theo khung: trang CV dựng theo khổ giấy
 * thật, nên iframe hẹp hơn 794px sẽ ngắt dòng khác hẳn bản in.
 *
 * `srcDoc` chứ không phải `src`: iframe không gửi kèm cookie SameSite=Lax nên trỏ
 * thẳng route sẽ ra 401. `allow-scripts` KHÔNG được bật - xem CLAUDE.md, mục
 * "Bấm vào bản xem trước", để biết vì sao `allow-same-origin` thì được.
 */
export function CvPreview({
  html,
  activeSection,
  onSectionClick,
}: {
  html: string | null;
  activeSection?: CvSectionKey | null;
  onSectionClick?: (key: CvSectionKey) => void;
}) {
  const boxRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLIFrameElement>(null);
  const [scale, setScale] = useState(0);

  const [loads, setLoads] = useState(0);

  useEffect(() => {
    const box = boxRef.current;
    if (!box) return;

    const observer = new ResizeObserver(([entry]) => {
      setScale(entry.contentRect.width / PAGE_WIDTH);
    });
    observer.observe(box);
    return () => observer.disconnect();
  }, []);

  const sectionAt = useCallback((target: EventTarget | null) => {
    const node = target as Element | null;
    if (!node || typeof node.closest !== "function") return null;
    return node.closest("[data-section]")?.getAttribute("data-section") ?? null;
  }, []);

  useEffect(() => {
    if (loads === 0 || !onSectionClick) return;
    const doc = frameRef.current?.contentDocument;
    if (!doc) return;

    const onClick = (event: MouseEvent) => {
      const key = sectionAt(event.target);
      if (key) onSectionClick(key as CvSectionKey);
    };

    doc.addEventListener("click", onClick);
    return () => doc.removeEventListener("click", onClick);
  }, [loads, onSectionClick, sectionAt]);

  useEffect(() => {
    if (loads === 0) return;
    const doc = frameRef.current?.contentDocument;
    if (!doc) return;

    const style = doc.createElement("style");
    style.textContent = `
      [data-section] {
        cursor: pointer;
        outline: 2px dashed transparent;
        outline-offset: 6px;
        transition: outline-color .15s;
      }
      [data-section]:hover { outline-color: rgba(79,70,229,.35); }
      [data-section].cv-active { outline-color: rgba(79,70,229,.85); }
    `;
    doc.head.appendChild(style);
    return () => style.remove();
  }, [loads]);

  useEffect(() => {
    if (loads === 0 || !activeSection || scale <= 0) return;
    const doc = frameRef.current?.contentDocument;
    const box = boxRef.current;
    if (!doc || !box) return;

    for (const node of doc.querySelectorAll("[data-section]")) {
      node.classList.toggle(
        "cv-active",
        node.getAttribute("data-section") === activeSection,
      );
    }

    const target = doc.querySelector(`[data-section="${activeSection}"]`);
    if (!target) return;

    box.scrollTo({
      top: Math.max(0, (target as HTMLElement).offsetTop * scale - 12),
      behavior: "smooth",
    });
  }, [loads, activeSection, scale]);

  return (
    <div
      ref={boxRef}
      className="aspect-210/297 w-full overflow-x-hidden overflow-y-auto rounded-lg border border-slate-200 bg-white shadow-sm"
    >
      {html && scale > 0 ? (
        <div style={{ height: PAGE_HEIGHT * PREVIEW_PAGES * scale }}>
          <iframe
            ref={frameRef}
            title="Xem trước CV"
            srcDoc={html}
            sandbox="allow-same-origin"
            onLoad={() => setLoads((n) => n + 1)}
            style={{
              width: PAGE_WIDTH,
              height: PAGE_HEIGHT * PREVIEW_PAGES,
              transform: `scale(${scale})`,
              transformOrigin: "top left",
              border: 0,
            }}
          />
        </div>
      ) : (
        <Skeleton className="size-full" />
      )}
    </div>
  );
}
