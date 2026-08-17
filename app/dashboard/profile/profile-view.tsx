"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Save, Upload } from "lucide-react";
import { apiErrorMessage, apiErrorStatus } from "@/lib/axios";
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

const LOGIN_NEXT = "/login?next=/dashboard/profile";

export function ProfileView() {
  const router = useRouter();
  // Tên và email lấy từ context của layout, không gọi lại `/auth/me`.
  const { user } = useSession();
  const [profile, setProfile] = useState<ProfileRecord | null>(null);
  const [draft, setDraft] = useState<ProfileDraft | null>(null);
  /** Bản nháp CV gần nhất còn giữ file gốc, `null` nếu chưa từng nộp. */
  const [cv, setCv] = useState<ProfileDraftRecord | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [tab, setTab] = useState("identity");

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      try {
        const [record, latest] = await Promise.all([
          profileService.get(),
          profileDraftService.latest().catch(() => null),
        ]);
        if (cancelled) return;
        setProfile(record);
        setDraft(toDraft(record));
        setCv(latest?.storageKey ? latest : null);
      } catch (err) {
        if (cancelled) return;
        // Cookie hết hạn giữa chừng: đưa về đăng nhập thay vì hiện lỗi mà người
        // dùng không làm gì được.
        if (apiErrorStatus(err) === 401) {
          router.replace(LOGIN_NEXT);
          return;
        }
        setError(apiErrorMessage(err, "Không tải được hồ sơ"));
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [router]);

  // Bản nháp gốc suy ra từ hồ sơ đang giữ, nên sau khi lưu xong nó tự khớp lại
  // với câu trả lời của backend và nút Lưu tắt đi mà không cần dọn tay.
  const baseline = useMemo(() => (profile ? toDraft(profile) : null), [profile]);
  const dirty =
    draft !== null &&
    baseline !== null &&
    JSON.stringify(draft) !== JSON.stringify(baseline);

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
      setProfile(updated);
      setDraft(toDraft(updated));
      setSaved(true);
    } catch (err) {
      if (apiErrorStatus(err) === 401) {
        router.replace(LOGIN_NEXT);
        return;
      }
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
                <Upload className="size-4" />
                Đọc từ CV
              </Button>
            </Link>
            <Button
              loading={saving}
              disabled={!dirty}
              onClick={() => void handleSave()}
            >
              <Save className="size-4" />
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
