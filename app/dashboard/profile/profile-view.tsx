"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useQueryClient } from "@tanstack/react-query";
import { FloppyDisk, Upload } from "@phosphor-icons/react/ssr";
import { apiErrorMessage } from "@/lib/axios";
import { useApiQuery } from "@/hooks/use-api-query";
import { invalidateAfter, keys } from "@/lib/query-keys";
import { profileDraftService, profileService } from "@/services";
import type { ProfileDraftRecord, ProfileRecord } from "@/services";
import { PageHeader } from "@/components/dashboard/page-header";
import { useSession } from "@/components/dashboard/session";
import { Alert, PageError } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Tabs } from "@/components/ui/tabs";
import {
  buildChanges,
  toDraft,
  PROFILE_TABS,
  type ProfileDraft,
  type ProfileUpdate,
} from "./profile-draft";
import { ProfileSkeleton, ProfileSummary } from "./profile-summary";
import { CareerSection } from "./sections/career-section";
import { ConditionsSection } from "./sections/conditions-section";
import { IdentitySection } from "./sections/identity-section";
import { RecordsSection } from "./sections/records-section";
import { SkillsSection } from "./sections/skills-section";

/** Hồ sơ và bản nháp CV gần nhất, gộp một mục cache để chúng luôn khớp nhau. */
interface ProfileData {
  profile: ProfileRecord;
  cv: ProfileDraftRecord | null;
}

export function ProfileView() {
  const queryClient = useQueryClient();
  // Tên và email lấy từ context của layout, không gọi lại `/auth/me`.
  const { user } = useSession();
  const [draft, setDraft] = useState<ProfileDraft | null>(null);
  /** Bản hồ sơ mà `draft` được gieo từ đó. Dùng để biết khi nào phải gieo lại. */
  const [draftOf, setDraftOf] = useState<ProfileRecord | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [tab, setTab] = useState("identity");

  const { data, error } = useApiQuery(
    keys.profile(),
    async () => {
      const [record, latest] = await Promise.all([
        profileService.get(),
        profileDraftService.latest().catch(() => null),
      ]);
      return { profile: record, cv: latest?.storageKey ? latest : null };
    },
    { errorMessage: "Không tải được hồ sơ" },
  );

  const profile = data?.profile ?? null;
  const cv = data?.cv ?? null;

  /*
   * Gieo bản nháp sửa được từ hồ sơ máy chủ, NGAY TRONG LÚC RENDER.
   *
   * Đây là mẫu React khuyến nghị cho "state phải đặt lại khi dữ liệu đổi", và
   * nó thay cho một `useEffect` gọi `setDraft` — thứ eslint của dự án đã chặn
   * một lần (`react-hooks/set-state-in-effect`) vì nó tốn thêm một vòng render
   * và dễ thành vòng lặp.
   *
   * Điều kiện so theo THAM CHIẾU của bản ghi, nên nó chỉ chạy khi máy chủ trả
   * về một bản mới: lần tải đầu, và ngay sau khi lưu. Một lượt nạp lại nền cũng
   * tạo tham chiếu mới, và đó là lý do phải có `!dirty` - nếu không, người dùng
   * đang gõ dở mà cache nạp lại là mất sạch những gì họ vừa nhập.
   */
  const baselineOfDraft = useMemo(
    () => (draftOf ? toDraft(draftOf) : null),
    [draftOf],
  );
  const dirty =
    draft !== null &&
    baselineOfDraft !== null &&
    JSON.stringify(draft) !== JSON.stringify(baselineOfDraft);

  if (profile && profile !== draftOf && !dirty) {
    setDraftOf(profile);
    setDraft(toDraft(profile));
  }

  const update = <K extends keyof ProfileDraft>(
    key: K,
    value: ProfileDraft[K],
  ): void => {
    setDraft((current) => (current ? { ...current, [key]: value } : current));
    // Người dùng gõ tiếp nghĩa là thông báo của lần lưu trước đã hết ý nghĩa.
    setSaved(false);
    setSaveError(null);
  };

  const handleSave = async (): Promise<void> => {
    if (!profile || !draft) return;

    let changes: ProfileUpdate;
    try {
      changes = buildChanges(draft, profile);
    } catch (err) {
      setSaveError(
        err instanceof Error ? err.message : "Dữ liệu nhập chưa hợp lệ",
      );
      return;
    }

    setSaving(true);
    setSaveError(null);
    setSaved(false);
    try {
      const updated = await profileService.update(changes);
      // Lấy nguyên bản backend trả về: `completion` được tính lại ở đó, tự dựng
      // lại con số ở client sẽ lệch ngay khi công thức chấm đổi.
      //
      // Ghi vào cache chứ không giữ bản sao riêng, và gieo lại bản nháp NGAY tại
      // đây: `dirty` vẫn còn true ở vòng render kế nên nhánh gieo lúc render sẽ
      // không tự chạy.
      queryClient.setQueryData(keys.profile(), (current: ProfileData | undefined) =>
        current ? { ...current, profile: updated } : current,
      );
      setDraftOf(updated);
      setDraft(toDraft(updated));
      setSaved(true);
      // Ô "mức độ hoàn thiện hồ sơ" trên Tổng quan tính lại sau mỗi lần lưu.
      invalidateAfter(queryClient, "saveProfile");
    } catch (err) {
      setSaveError(apiErrorMessage(err, "Không lưu được hồ sơ"));
    } finally {
      setSaving(false);
    }
  };

  if (error) return <PageError title="Không tải được hồ sơ" message={error} />;

  if (!profile || !draft) return <ProfileSkeleton />;

  const sectionProps = { draft, update };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Hồ sơ của tôi"
        subtitle="Hồ sơ càng đầy đủ, việc chấm điểm độ phù hợp càng sát thực tế"
        actions={
          <>
            {dirty && (
              <span className="text-xs font-medium text-amber-600">
                Có thay đổi chưa lưu
              </span>
            )}
            {cv && (
              <a
                href={profileDraftService.fileUrl(cv.id)}
                target="_blank"
                rel="noreferrer"
                className="text-xs text-slate-500 underline hover:text-slate-700"
              >
                CV gần nhất: {cv.filename}
              </a>
            )}
            {/* Lối vào Agent 1. Đặt cạnh nút Lưu vì đây là hai cách điền cùng một
                hồ sơ: gõ tay, hoặc để AI đọc CV rồi tự chọn nhận phần nào. */}
            <Link href="/dashboard/profile/upload">
              <Button variant="outline">
                <Upload className="size-4.5" />
                Đọc từ CV
              </Button>
            </Link>
            <Button
              loading={saving}
              disabled={!dirty}
              onClick={() => void handleSave()}
            >
              <FloppyDisk className="size-4.5" />
              Lưu thay đổi
            </Button>
          </>
        }
      />

      {saveError && <Alert tone="danger">{saveError}</Alert>}

      {saved && (
        <Alert tone="success">
          Đã lưu hồ sơ. Mức hoàn thiện được tính lại theo dữ liệu mới.
        </Alert>
      )}

      <ProfileSummary profile={profile} user={user} />

      <Tabs tabs={PROFILE_TABS} value={tab} onChange={setTab} />

      {tab === "identity" && <IdentitySection {...sectionProps} />}
      {tab === "skills" && <SkillsSection {...sectionProps} />}
      {tab === "career" && <CareerSection {...sectionProps} />}
      {tab === "conditions" && <ConditionsSection {...sectionProps} />}
      {tab === "records" && <RecordsSection {...sectionProps} />}
    </div>
  );
}
