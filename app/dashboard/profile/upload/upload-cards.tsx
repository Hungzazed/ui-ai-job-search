"use client";

import {
  ArrowCounterClockwise,
  Check,
  CircleNotch,
  FileText,
  Info,
  Upload,
} from "@phosphor-icons/react/ssr";
import type { PartialProposal } from "@/lib/profile-partial";
import { failureMessage, isWorthRetrying } from "@/lib/failure-message";
import type { ProfileDraftRecord } from "@/services";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { SectionCard } from "@/components/ui/section-card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/utils";

export function UploadCard({
  file,
  onPick,
  onUpload,
  uploading,
  disabled,
}: {
  file: File | null;
  onPick: (file: File | null) => void;
  onUpload: () => void;
  uploading: boolean;
  disabled: boolean;
}) {
  return (
    <SectionCard
      title="Nộp CV"
      icon={Upload}
      description="Chỉ nhận PDF, tối đa 10MB. Cần bản PDF có lớp text — bản scan hoặc ảnh chụp chưa đọc được."
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        {/*
          Vẫn là `<input type="file">` GỐC, chỉ ẩn đi và bọc trong `<label>`.

          Không dựng vùng kéo-thả tự viết: input gốc đã có sẵn điều hướng bàn phím,
          hoạt động với trình đọc màn hình, và mở đúng hộp thoại chọn file của hệ
          điều hành. Một vùng kéo-thả tự dựng phải cài lại cả ba thứ đó mới ngang
          bằng.

          Vì sao ẩn rồi bọc `<label>` thay vì tạo kiểu bằng `file:`: chữ trên nút
          của input file do TRÌNH DUYỆT sinh và **CSS không đổi được** — trên máy
          tiếng Anh nó hiện "Choose File / No file chosen" ngay giữa một giao diện
          tiếng Việt. `sr-only` giữ input trong luồng tab và vẫn nhận click từ
          label, nên không mất khả năng truy cập nào.
        */}
        <label
          className={cn(
            "flex min-w-0 flex-1 cursor-pointer items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm transition-colors hover:border-slate-300 sm:max-w-md",
            (uploading || disabled) && "cursor-not-allowed opacity-60",
          )}
        >
          <input
            type="file"
            accept="application/pdf,.pdf"
            disabled={uploading || disabled}
            onChange={(event) => onPick(event.target.files?.[0] ?? null)}
            className="sr-only"
          />
          <span className="shrink-0 rounded-md bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
            Chọn file
          </span>
          <span
            className={cn(
              "min-w-0 flex-1 truncate",
              file ? "text-slate-800" : "text-slate-400",
            )}
          >
            {file ? file.name : "Chưa chọn file nào"}
          </span>
        </label>

        <Button
          onClick={onUpload}
          disabled={!file || uploading || disabled}
          className="shrink-0"
        >
          <FileText className="size-4.5" />
          {uploading ? "Đang nộp…" : "Đọc CV này"}
        </Button>
      </div>

      {file && (
        <p className="mt-2 text-xs text-slate-500">
          {Math.max(1, Math.round(file.size / 1024))} KB
        </p>
      )}
    </SectionCard>
  );
}

const LIVE_ROWS = [
  { label: "Chức danh", of: (p: PartialProposal) => p.headline },
  { label: "Tóm tắt bản thân", of: (p: PartialProposal) => p.summary },
  { label: "Kỹ năng chính", of: (p: PartialProposal) => p.primarySkills?.length },
  { label: "Kinh nghiệm", of: (p: PartialProposal) => p.experiences?.length },
  { label: "Học vấn", of: (p: PartialProposal) => p.educations?.length },
] as const;

export function RunningCard({
  draft,
  partial,
}: {
  draft: ProfileDraftRecord | null;
  partial?: PartialProposal | null;
}) {
  // Số liệu trích xuất có NGAY từ lúc nộp, trước khi model chạy. Hiện luôn: một CV
  // 6 trang chỉ ra 400 ký tự là dấu hiệu rất rõ, và biết sớm thì đỡ chờ vô ích.
  const meta = draft?.evidence?.[0]?.meta;

  return (
    <SectionCard
      title="Đang đọc CV"
      icon={Info}
      description="Kết quả hiện dần ngay khi AI đọc xong từng phần. Rời trang cũng không mất: lượt đọc được xếp lại vào hàng đợi."
    >
      {partial ? (
        <ul className="space-y-2">
          {LIVE_ROWS.map(({ label, of }) => {
            const value = of(partial);
            const done =
              typeof value === "number" ? value > 0 : Boolean(value);
            return (
              <li key={label} className="flex items-center gap-2 text-sm">
                {done ? (
                  <Check className="size-4.5 shrink-0 text-emerald-600" />
                ) : (
                  <CircleNotch className="size-4.5 shrink-0 animate-spin text-slate-300" />
                )}
                <span className={done ? "text-slate-800" : "text-slate-400"}>
                  {label}
                </span>
                {typeof value === "number" && value > 0 && (
                  <span className="ml-auto text-xs font-semibold text-slate-500">
                    {value} mục
                  </span>
                )}
              </li>
            );
          })}
        </ul>
      ) : (
        <div className="flex items-center gap-3">
          <Skeleton className="h-9 w-9 shrink-0 animate-pulse rounded-lg" />
          <div className="min-w-0 flex-1 space-y-2">
            <Skeleton className="h-3 w-2/3 animate-pulse" />
            <Skeleton className="h-3 w-1/3 animate-pulse" />
          </div>
        </div>
      )}

      {meta && (
        <p className="mt-4 text-xs text-slate-500">
          Đã rút được{" "}
          <span className="font-mono font-semibold text-slate-700">
            {String(meta.chars)}
          </span>{" "}
          ký tự từ {String(meta.pagesRead)}/{String(meta.pages)} trang
          {meta.truncated === true && " (đã cắt phần cuối vì CV quá dài)"}.
        </p>
      )}
    </SectionCard>
  );
}

/**
 * `isWorthRetrying` sai với `SCHEMA`: model trả sai cấu trúc thì bấm lại cũng
 * hỏng như cũ, và mỗi lần bấm là một lượt gọi bị đốt. Ba loại còn lại đều là
 * "hệ thống bận", tức đáng thử lại.
 */
export function FailedCard({
  draft,
  onRetry,
  retrying,
}: {
  draft: ProfileDraftRecord;
  onRetry: () => void;
  retrying: boolean;
}) {
  return (
    <Alert tone="danger" title="Không đọc được CV này">
      <p>{failureMessage(draft.failureKind)}</p>
      {isWorthRetrying(draft.failureKind) && (
        <>
          <p className="mt-2 text-xs">
            Bằng chứng đã đọc từ CV vẫn còn, nên chạy lại không cần nộp lại file.
          </p>
          <Button
            variant="outline"
            onClick={onRetry}
            disabled={retrying}
            className="mt-3"
          >
            <ArrowCounterClockwise className="size-4.5" />
            {retrying ? "Đang xếp lại…" : "Thử lại"}
          </Button>
        </>
      )}
    </Alert>
  );
}

