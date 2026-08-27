"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { PartialProposal } from "@/lib/profile-partial";
import { ModelStreamError, streamModel } from "@/lib/model-stream";
import { apiErrorMessage, apiErrorStatus } from "@/lib/axios";
import {
  defaultSelection,
  proposalRows,
  type ApplicableField,
} from "@/lib/profile-draft-content";
import {
  profileDraftService,
  profileService,
  type ProfileDraftRecord,
  type ProfileRecord,
} from "@/services";

const LOGIN_NEXT = "/login?next=/dashboard/profile/upload";

/// Nhịp hỏi lại trạng thái, và số lần tối đa.
///
/// Đường đọc CV đặt timeout 180 giây (`SYNTHESIS_TIMEOUT_MS`), nên 3 giây × 70 lần
/// = 210 giây, rộng hơn một chút để còn kịp nhận trạng thái FAILED do chính backend
/// ghi thay vì tự bỏ cuộc trước rồi hiện một câu chung chung.
const POLL_MS = 2_000;
const MAX_POLLS = 105;

/// Toàn bộ trạng thái và tác vụ của màn đọc CV. Tách khỏi phần render để mỗi
/// bên đọc được riêng: một bên là máy trạng thái, bên kia chỉ là bố cục.
export function useCvUpload() {
  const router = useRouter();
  const mounted = useRef(true);

  const [profile, setProfile] = useState<ProfileRecord | null>(null);
  const [draft, setDraft] = useState<ProfileDraftRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [file, setFile] = useState<File | null>(null);
  const [partial, setPartial] = useState<PartialProposal | null>(null);
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
      const receipt = await profileDraftService.uploadCv(file, true);
      if (!mounted.current) return;
      // Đọc lại ngay để có bản ghi đầy đủ (biên nhận chỉ có draftId và số liệu).
      setDraft(await profileDraftService.get(receipt.draftId));
      setFile(null);

      try {
        const done = await streamModel<ProfileDraftRecord, PartialProposal>({
          path: `/profile-drafts/${receipt.draftId}/synthesize-stream`,
          onPartial: (value) => {
            if (mounted.current) setPartial(value);
          },
        });
        if (mounted.current) setDraft(done);
      } catch (streamError) {
        if (!mounted.current) return;
        setError(
          streamError instanceof ModelStreamError
            ? streamError.message
            : "Không đọc được CV",
        );
      } finally {
        if (mounted.current) setPartial(null);
      }
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

  return {
    draft,
    loading,
    error,
    file,
    setFile,
    uploading,
    retrying,
    selected,
    applying,
    applied,
    rows,
    partial,
    running,
    upload,
    retry,
    apply,
    toggle,
  };
}
