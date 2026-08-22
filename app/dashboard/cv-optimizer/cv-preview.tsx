"use client";

import { useEffect, useRef, useState } from "react";
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
 * thẳng route sẽ ra 401. `sandbox` rỗng là lớp chặn thứ hai sau `escapeHtml`.
 */
export function CvPreview({ html }: { html: string | null }) {
  const boxRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0);

  useEffect(() => {
    const box = boxRef.current;
    if (!box) return;

    const observer = new ResizeObserver(([entry]) => {
      setScale(entry.contentRect.width / PAGE_WIDTH);
    });
    observer.observe(box);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={boxRef}
      className="aspect-[210/297] w-full overflow-y-auto overflow-x-hidden rounded-lg border border-slate-200 bg-white shadow-sm"
    >
      {html && scale > 0 ? (
        <div style={{ height: PAGE_HEIGHT * PREVIEW_PAGES * scale }}>
          <iframe
            title="Xem trước CV"
            srcDoc={html}
            sandbox=""
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
