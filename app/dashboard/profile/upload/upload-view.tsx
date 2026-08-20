"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle2,
  FileText,
  Info,
  RotateCcw,
  TriangleAlert,
  Upload,
} from "lucide-react";
import { apiErrorMessage, apiErrorStatus } from "@/lib/axios";
import { failureMessage, isWorthRetrying } from "@/lib/failure-message";
import {
  defaultSelection,
  isProposalEmpty,
  proposalRows,
  type ApplicableField,
  type ProposalRow,
} from "@/lib/profile-draft-content";
import {
  profileDraftService,
  profileService,
  type ProfileDraftRecord,
  type ProfileRecord,
} from "@/services";
import { PageHeader } from "@/components/dashboard/page-header";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SectionCard } from "@/components/ui/section-card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/utils";

const LOGIN_NEXT = "/login?next=/dashboard/profile/upload";

/// Nhịp hỏi lại trạng thái, và số lần tối đa.
///
/// Đường đọc CV đặt timeout 180 giây (`SYNTHESIS_TIMEOUT_MS`), nên 3 giây × 70 lần
/// = 210 giây, rộng hơn một chút để còn kịp nhận trạng thái FAILED do chính backend
/// ghi thay vì tự bỏ cuộc trước rồi hiện một câu chung chung.
const POLL_MS = 3_000;
const MAX_POLLS = 70;

export function UploadCvView() {
  const router = useRouter();
  const mounted = useRef(true);

  const [profile, setProfile] = useState<ProfileRecord | null>(null);
  const [draft, setDraft] = useState<ProfileDraftRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [waiting, setWaiting] = useState(false);
  const [retrying, setRetrying] = useState(false);

  const [selected, setSelected] = useState<ApplicableField[]>([]);
  const [applying, setApplying] = useState(false);
  const [applied, setApplied] = useState(false);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  // Tải hồ sơ hiện tại VÀ bản nháp mới nhất cùng lúc. Cần cả hai ngay từ đầu: màn
  // xác nhận đặt đề xuất cạnh giá trị đang có, nên thiếu hồ sơ thì mọi hàng đều
  // trông như "chưa có gì" và người dùng tích bừa.
  useEffect(() => {
    let cancelled = false;

    void (async () => {
      try {
        const [current, latest] = await Promise.all([
          profileService.get().catch(() => null),
          profileDraftService.latest().catch((err: unknown) => {
            // 404 KHÔNG phải lỗi: nghĩa là chưa từng nộp CV nào.
            if (apiErrorStatus(err) === 404) return null;
            throw err;
          }),
        ]);
        if (cancelled) return;
        setProfile(current);
        setDraft(latest);
        if (latest?.proposal) {
          setSelected(defaultSelection(proposalRows(latest.proposal, current)));
        }
      } catch (err) {
        if (cancelled) return;
        if (apiErrorStatus(err) === 401) {
          router.replace(LOGIN_NEXT);
          return;
        }
        setError(apiErrorMessage(err, "Không tải được dữ liệu hồ sơ"));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [router]);

  /**
   * Hỏi lại tới khi bản nháp xong hoặc hỏng.
   *
   * Vòng lặp tự gọi lại thay vì `setInterval`: mỗi lần hỏi phải chờ lần trước xong,
   * nếu không thì khi backend chậm sẽ có nhiều request xếp chồng lên nhau.
   */
  const waitForDraft = async (draftId: string) => {
    setWaiting(true);
    for (let attempt = 0; attempt < MAX_POLLS; attempt += 1) {
      await new Promise((resolve) => setTimeout(resolve, POLL_MS));
      if (!mounted.current) return;

      try {
        const current = await profileDraftService.get(draftId);
        if (!mounted.current) return;
        setDraft(current);

        if (current.status === "DONE" || current.status === "FAILED") {
          setWaiting(false);
          if (current.proposal) {
            setSelected(
              defaultSelection(proposalRows(current.proposal, profile)),
            );
          }
          return;
        }
      } catch (err) {
        if (!mounted.current) return;
        if (apiErrorStatus(err) === 401) {
          router.replace(LOGIN_NEXT);
          return;
        }
        // Một lần hỏi hỏng không có nghĩa là cả lượt đọc hỏng — hỏi tiếp.
      }
    }

    if (!mounted.current) return;
    setWaiting(false);
    setError(
      "Chờ quá lâu mà chưa có kết quả. Lượt đọc vẫn đang chạy ở nền — mở lại trang sau ít phút.",
    );
  };

  const upload = async () => {
    if (!file) return;
    setUploading(true);
    setError(null);
    setApplied(false);

    try {
      const receipt = await profileDraftService.uploadCv(file);
      if (!mounted.current) return;
      // Đọc lại ngay để có bản ghi đầy đủ (biên nhận chỉ có draftId và số liệu).
      setDraft(await profileDraftService.get(receipt.draftId));
      setFile(null);
      void waitForDraft(receipt.draftId);
    } catch (err) {
      if (!mounted.current) return;
      if (apiErrorStatus(err) === 401) {
        router.replace(LOGIN_NEXT);
        return;
      }
      // Backend trả câu tiếng Việt đã soạn cho từng nguyên nhân (file scan, có mật
      // khẩu, quá lớn, không phải PDF) — hiện đúng câu đó.
      setError(apiErrorMessage(err, "Không nộp được CV"));
    } finally {
      if (mounted.current) setUploading(false);
    }
  };

  /**
   * Chạy lại lượt đọc mà không bắt nộp lại file — bằng chứng đã nằm trong bản
   * nháp. Dùng chung `waitForDraft` với luồng nộp mới, vì từ lúc này trở đi hai
   * luồng giống hệt nhau.
   */
  const retry = async () => {
    if (!draft) return;
    setRetrying(true);
    setError(null);

    try {
      const restarted = await profileDraftService.retry(draft.id);
      if (!mounted.current) return;
      setDraft(restarted);
      void waitForDraft(restarted.id);
    } catch (err) {
      if (!mounted.current) return;
      if (apiErrorStatus(err) === 401) {
        router.replace(LOGIN_NEXT);
        return;
      }
      setError(apiErrorMessage(err, "Không chạy lại được lượt đọc"));
    } finally {
      if (mounted.current) setRetrying(false);
    }
  };

  const apply = async () => {
    if (!draft || selected.length === 0) return;
    setApplying(true);
    setError(null);

    try {
      const updated = await profileDraftService.apply(draft.id, selected);
      if (!mounted.current) return;
      setDraft(updated);
      setApplied(true);
      setProfile(await profileService.get().catch(() => profile));
    } catch (err) {
      if (!mounted.current) return;
      if (apiErrorStatus(err) === 401) {
        router.replace(LOGIN_NEXT);
        return;
      }
      setError(apiErrorMessage(err, "Không áp dụng được vào hồ sơ"));
    } finally {
      if (mounted.current) setApplying(false);
    }
  };

  const toggle = (field: ApplicableField) =>
    setSelected((current) =>
      current.includes(field)
        ? current.filter((item) => item !== field)
        : [...current, field],
    );

  const rows = draft?.proposal ? proposalRows(draft.proposal, profile) : [];
  const running =
    waiting || draft?.status === "PENDING" || draft?.status === "RUNNING";

  return (
    <div className="space-y-6">
      <PageHeader
        title="Đọc hồ sơ từ CV"
        subtitle="Nộp CV PDF, AI đọc thành đề xuất — bạn chọn nhận phần nào"
        actions={
          <Link href="/dashboard/profile">
            <Button variant="outline">
              <ArrowLeft className="size-4" />
              Về hồ sơ
            </Button>
          </Link>
        }
      />

      {error && <Alert tone="danger">{error}</Alert>}

      <UploadCard
        file={file}
        onPick={setFile}
        onUpload={() => void upload()}
        uploading={uploading}
        disabled={running}
      />

      {loading ? (
        <Skeleton className="h-48 animate-pulse" />
      ) : running ? (
        <RunningCard draft={draft} />
      ) : draft?.status === "FAILED" ? (
        <FailedCard
          draft={draft}
          onRetry={() => void retry()}
          retrying={retrying}
        />
      ) : draft?.status === "DONE" ? (
        <ReviewCard
          draft={draft}
          rows={rows}
          selected={selected}
          onToggle={toggle}
          onApply={() => void apply()}
          applying={applying}
          applied={applied}
        />
      ) : null}
    </div>
  );
}

function UploadCard({
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
          <FileText className="size-4" />
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

function RunningCard({ draft }: { draft: ProfileDraftRecord | null }) {
  // Số liệu trích xuất có NGAY từ lúc nộp, trước khi model chạy. Hiện luôn: một CV
  // 6 trang chỉ ra 400 ký tự là dấu hiệu rất rõ, và biết sớm thì đỡ chờ vô ích.
  const meta = draft?.evidence?.[0]?.meta;

  return (
    <SectionCard
      title="Đang đọc CV"
      icon={Info}
      description="Một lượt mất khoảng 40–90 giây. Bạn có thể rời trang, kết quả vẫn được lưu."
    >
      <div className="flex items-center gap-3">
        <Skeleton className="h-9 w-9 shrink-0 animate-pulse rounded-lg" />
        <div className="min-w-0 flex-1 space-y-2">
          <Skeleton className="h-3 w-2/3 animate-pulse" />
          <Skeleton className="h-3 w-1/3 animate-pulse" />
        </div>
      </div>

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
function FailedCard({
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
            <RotateCcw className="size-4" />
            {retrying ? "Đang xếp lại…" : "Thử lại"}
          </Button>
        </>
      )}
    </Alert>
  );
}

function ReviewCard({
  draft,
  rows,
  selected,
  onToggle,
  onApply,
  applying,
  applied,
}: {
  draft: ProfileDraftRecord;
  rows: ProposalRow[];
  selected: ApplicableField[];
  onToggle: (field: ApplicableField) => void;
  onApply: () => void;
  applying: boolean;
  applied: boolean;
}) {
  if (isProposalEmpty(draft.proposal)) {
    return (
      <Alert tone="warning" title="Đọc xong nhưng không rút được gì">
        AI không tìm thấy thông tin hồ sơ nào trong file này. Thường là do CV có rất
        ít chữ, hoặc phần lớn nội dung nằm trong ảnh. Hãy thử một bản PDF xuất trực
        tiếp từ Word, LaTeX hoặc Canva.
      </Alert>
    );
  }

  const overwriting = rows.filter(
    (row) => row.overwrites && selected.includes(row.field),
  );

  return (
    <div className="space-y-4">
      {applied && (
        <Alert tone="success" title="Đã cập nhật hồ sơ" icon={CheckCircle2}>
          Những trường bạn chọn đã được ghi vào hồ sơ.{" "}
          <Link
            href="/dashboard/profile"
            className="font-semibold underline underline-offset-2"
          >
            Mở hồ sơ để xem
          </Link>
          .
        </Alert>
      )}

      <SectionCard
        title="AI đề xuất — bạn chọn nhận phần nào"
        icon={FileText}
        description={
          draft.filename
            ? `Đọc từ ${draft.filename}. Không gì được ghi vào hồ sơ cho tới khi bạn bấm áp dụng.`
            : "Không gì được ghi vào hồ sơ cho tới khi bạn bấm áp dụng."
        }
        actions={
          <div className="flex items-center gap-2">
            {draft.filename && (
              <a
                href={profileDraftService.fileUrl(draft.id)}
                target="_blank"
                rel="noreferrer"
              >
                <Button size="sm" variant="outline">
                  <FileText className="size-3.5" />
                  Xem CV gốc
                </Button>
              </a>
            )}
            <Badge variant={draft.appliedAt ? "success" : "neutral"}>
              {draft.appliedAt ? "Đã áp dụng" : "Chờ xác nhận"}
            </Badge>
          </div>
        }
      >
        <div className="divide-y divide-slate-100">
          {rows.map((row) => (
            <FieldRow
              key={row.field}
              row={row}
              checked={selected.includes(row.field)}
              onToggle={() => onToggle(row.field)}
            />
          ))}
        </div>

        <div className="mt-5 flex flex-col gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-slate-500">
            Đã chọn{" "}
            <span className="font-semibold text-slate-800">
              {selected.length}
            </span>{" "}
            trường
            {overwriting.length > 0 && (
              <span className="text-amber-700">
                {" "}
                · {overwriting.length} trường sẽ ghi đè dữ liệu hiện có
              </span>
            )}
          </p>
          <Button onClick={onApply} disabled={selected.length === 0 || applying}>
            <CheckCircle2 className="size-4" />
            {applying ? "Đang áp dụng…" : "Áp dụng vào hồ sơ"}
          </Button>
        </div>
      </SectionCard>

      {(draft.proposal?.missing.length ?? 0) > 0 && (
        <SectionCard
          title="AI không tìm thấy trong CV"
          icon={TriangleAlert}
          iconClassName="bg-amber-50 text-amber-700"
          description="Những phần này phải tự điền ở màn Hồ sơ — hệ thống cố ý không đoán chúng."
          compact
        >
          <ul className="space-y-1.5">
            {draft.proposal?.missing.map((item) => (
              <li key={item} className="flex gap-2 text-sm text-slate-600">
                <span className="text-slate-400">•</span>
                {item}
              </li>
            ))}
          </ul>
        </SectionCard>
      )}

      {(draft.proposal?.notes.length ?? 0) > 0 && (
        <SectionCard title="Ghi chú khi đọc" icon={Info} compact>
          <ul className="space-y-1.5">
            {draft.proposal?.notes.map((item) => (
              <li key={item} className="flex gap-2 text-sm text-slate-600">
                <span className="text-slate-400">•</span>
                {item}
              </li>
            ))}
          </ul>
        </SectionCard>
      )}
    </div>
  );
}

function FieldRow({
  row,
  checked,
  onToggle,
}: {
  row: ProposalRow;
  checked: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="flex gap-3 py-3.5">
      {/*
        Checkbox gốc, và nó bị `disabled` khi model không có gì cho trường này —
        hàng vẫn hiện để người dùng biết AI đã xem trường đó và không tìm ra, nhưng
        không thể tích một thứ không có nội dung.
      */}
      <input
        type="checkbox"
        checked={checked}
        disabled={row.isEmpty}
        onChange={onToggle}
        id={`field-${row.field}`}
        className="mt-0.5 size-4 shrink-0 cursor-pointer rounded border-slate-300 text-primary-600 focus:ring-primary-500 disabled:cursor-not-allowed disabled:opacity-40"
      />

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <label
            htmlFor={`field-${row.field}`}
            className={cn(
              "text-sm font-semibold",
              row.isEmpty
                ? "cursor-not-allowed text-slate-400"
                : "cursor-pointer text-slate-900",
            )}
          >
            {row.label}
          </label>
          {/*
            Ba nhãn cho ba tình huống khác nhau, và chúng phải khác nhau: trước đây
            chỉ có "ghi đè", nên trường "Quốc gia" bị dán nhãn cảnh báo trong khi cả
            hai bên đều là "Việt Nam". Cảnh báo về một mất mát không tồn tại làm
            người dùng bỏ qua cả những cảnh báo thật.
          */}
          {row.isEmpty ? (
            <Badge variant="neutral" className="text-[11px]">
              không tìm thấy
            </Badge>
          ) : row.unchanged ? (
            <Badge variant="neutral" className="text-[11px]">
              giống hồ sơ hiện tại
            </Badge>
          ) : row.overwrites ? (
            <Badge variant="warning" className="text-[11px]">
              ghi đè
            </Badge>
          ) : null}
        </div>

        {!row.isEmpty && (
          <div className="mt-1.5 grid gap-2 sm:grid-cols-2">
            <ValueBlock
              caption="AI đề xuất"
              lines={row.proposed}
              tone="proposed"
            />
            {/* Cột "đang có" CHỈ hiện khi thật sự có dữ liệu sẽ bị ghi đè. Hiện một
                ô "chưa có" rỗng ở mọi hàng chỉ làm loãng đúng thứ cần chú ý. */}
            {row.overwrites && (
              <ValueBlock
                caption="Hồ sơ đang có"
                lines={row.current}
                tone="current"
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/// Số dòng hiện tối đa trước khi gộp phần còn lại thành một dòng đếm.
///
/// Một CV có thể cho ra 25 kỹ năng; in hết thì một hàng cao hơn cả màn hình và bảng
/// xác nhận không còn đọc được theo chiều dọc.
const MAX_LINES = 6;

function ValueBlock({
  caption,
  lines,
  tone,
}: {
  caption: string;
  lines: string[];
  tone: "proposed" | "current";
}) {
  const shown = lines.slice(0, MAX_LINES);
  const hidden = lines.length - shown.length;

  return (
    <div
      className={cn(
        "rounded-lg border p-2.5",
        tone === "proposed"
          ? "border-primary-100 bg-primary-50/40"
          : "border-slate-200 bg-slate-50/60",
      )}
    >
      <p className="mb-1 text-[11px] font-semibold tracking-wide text-slate-500 uppercase">
        {caption}
      </p>
      <ul className="space-y-0.5">
        {shown.map((line) => (
          <li key={line} className="text-xs leading-relaxed text-slate-700">
            {line}
          </li>
        ))}
      </ul>
      {hidden > 0 && (
        <p className="mt-1 text-[11px] text-slate-400">
          … và {hidden} dòng nữa
        </p>
      )}
    </div>
  );
}
