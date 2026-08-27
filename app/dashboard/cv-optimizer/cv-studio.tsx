"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Check, Download, LayoutTemplate } from "lucide-react";
import {
  documentsService,
  type CvContentInput,
  type CvLayout,
  type CvSectionKey,
  type DocumentRecord,
} from "@/services";
import { apiErrorMessage } from "@/lib/axios";
import { useApiQuery } from "@/hooks/use-api-query";
import { parseCvContent } from "@/lib/document-content";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { SectionCard } from "@/components/ui/section-card";
import { Tabs } from "@/components/ui/tabs";
import { CvEditor } from "./cv-editor";
import { CvPreview } from "./cv-preview";
import { CvTemplatePicker } from "./cv-template-picker";

const SECTION_KEYS: CvSectionKey[] = [
  "profile",
  "competencies",
  "experience",
  "projects",
  "education",
  "skills",
];

const TABS = [
  { value: "noi-dung", label: "Nội dung" },
  { value: "mau", label: "Mẫu trình bày" },
];

/** Chờ ngần này sau phím cuối rồi mới tải lại bản xem trước. */
const PREVIEW_DEBOUNCE_MS = 400;

/** Bản đã lưu chuyển thành bản nháp sửa được: `null` thành chuỗi rỗng. */
const toDraft = (raw: unknown): CvContentInput => {
  const cv = parseCvContent(raw);
  return {
    profileStatement: cv.profileStatement ?? "",
    coreCompetencies: cv.coreCompetencies,
    experiences: cv.experiences.map((experience) => ({
      position: experience.position ?? "",
      company: experience.company ?? "",
      location: experience.location ?? "",
      period: experience.period ?? "",
      bullets: experience.bullets,
    })),
    projects: cv.projects.map((project) => ({
      name: project.name ?? "",
      role: project.role ?? "",
      organization: project.organization ?? "",
      period: project.period ?? "",
      description: project.description ?? "",
      bullets: project.bullets,
      tools: project.tools,
    })),
    educations: cv.educations.map((education) => ({
      degree: education.degree ?? "",
      institution: education.institution ?? "",
      period: education.period ?? "",
      detail: education.detail ?? "",
    })),
    skillGroups: cv.skillGroups.map((group) => ({
      label: group.label ?? "",
      items: group.items,
    })),
  };
};

/** Bố cục đã lưu, điền mặc định cho phần thiếu. Bản rút gọn của `resolveLayout`. */
const toLayout = (raw: CvLayout | null): CvLayout => {
  const order = (raw?.order ?? []).filter((key) => SECTION_KEYS.includes(key));
  const missing = SECTION_KEYS.filter((key) => !order.includes(key));
  return { order: [...order, ...missing], hidden: raw?.hidden ?? [] };
};

/**
 * Bàn làm việc của một CV: sửa nội dung, chọn mẫu, xem trước, tải PDF.
 *
 * Giữ TOÀN BỘ bản nháp ở đây thay vì để mỗi tab tự giữ: hai tab cùng đổi một tờ
 * giấy, nên chỉ được có một nguồn sự thật và một khung xem trước.
 */
export function CvStudio({
  record,
  onSaved,
}: {
  record: DocumentRecord;
  onSaved: () => void;
}) {
  const [tab, setTab] = useState(TABS[0].value);

  const saved = useMemo(
    () => ({
      content: toDraft(record.content),
      layout: toLayout(record.layout),
      templateId: record.templateId,
      accent: record.templateOptions?.accent,
    }),
    [record],
  );

  const [content, setContent] = useState(saved.content);
  const [layout, setLayout] = useState(saved.layout);
  const [templateId, setTemplateId] = useState(saved.templateId);
  const [accent, setAccent] = useState(saved.accent);

  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const draft = useMemo(
    () => ({ content, layout, templateId, accent }),
    [content, layout, templateId, accent],
  );
  const previewKey = `${record.id}|${JSON.stringify(draft)}`;

  /*
   * Hoãn 400ms rồi mới đổi KHOÁ, thay vì hoãn lời gọi.
   *
   * Người dùng gõ liên tục nên phải có nhịp hoãn; nhưng hoãn ở tầng khoá thì
   * phần còn lại là việc của cache: một bản nháp đã dựng rồi hiện lại tức thì,
   * không tốn request. Đó là chuyện xảy ra thật mỗi lần bấm thử qua lại giữa
   * hai mẫu, hoặc gõ nhầm rồi xoá đi.
   *
   * `setState` nằm trong callback của timer, không nằm thẳng trong thân effect
   * — đây là hẹn giờ thật, không phải một vòng đồng bộ state thừa.
   */
  const [debouncedKey, setDebouncedKey] = useState(previewKey);
  useEffect(() => {
    const timer = setTimeout(
      () => setDebouncedKey(previewKey),
      PREVIEW_DEBOUNCE_MS,
    );
    return () => clearTimeout(timer);
  }, [previewKey]);

  /*
   * `keepPrevious`: giữ bản vẽ trước trên màn trong lúc bản mới đang dựng. Bản
   * cũ để `html` về null giữa hai lượt, nên cứ mỗi nhịp ngừng gõ là khung xem
   * trước chớp thành khung xám rồi mới hiện lại.
   *
   * Lượt tải cũ về muộn không đè được lên bản mới: cache khoá theo bản nháp, nên
   * mỗi phản hồi chỉ rơi đúng vào ô của chính nó.
   */
  const preview = useApiQuery(
    ["cv-preview", debouncedKey],
    () => documentsService.previewDraft(record.id, draft),
    {
      errorMessage: "Không tải được bản xem trước",
      keepPrevious: true,
    },
  );

  const html = preview.data;
  const error = saveError ?? preview.error;
  const dirty = previewKey !== `${record.id}|${JSON.stringify(saved)}`;

  const handleSave = useCallback(async () => {
    setSaving(true);
    setSaveError(null);
    try {
      await documentsService.updateCv(record.id, { content, layout });
      if (templateId !== saved.templateId || accent !== saved.accent) {
        await documentsService.setTemplate(record.id, templateId, accent);
      }
      onSaved();
    } catch (cause: unknown) {
      setSaveError(apiErrorMessage(cause, "Không lưu được thay đổi"));
    } finally {
      setSaving(false);
    }
  }, [record.id, content, layout, templateId, accent, saved, onSaved]);

  const handleDownload = useCallback(async () => {
    setSaveError(null);
    try {
      const blob = await documentsService.pdf(record.id, "html");
      const url = URL.createObjectURL(blob);
      window.open(url, "_blank", "noopener");
      // Thu hồi ngay thì tab vừa mở chưa kịp đọc xong blob.
      setTimeout(() => URL.revokeObjectURL(url), 60_000);
    } catch (cause: unknown) {
      setSaveError(apiErrorMessage(cause, "Không tạo được PDF"));
    }
  }, [record.id]);

  return (
    <SectionCard
      compact
      icon={LayoutTemplate}
      title="Sửa CV"
      description="Sửa thoải mái — chỉ khi bấm “Lưu thay đổi” mới ghi lại"
      className="border-slate-200/90"
      contentClassName="space-y-4"
      actions={
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={handleDownload}>
            <Download className="size-4" />
            Tải PDF
          </Button>
          <Button size="sm" onClick={handleSave} loading={saving} disabled={!dirty}>
            <Check className="size-4" />
            {dirty ? "Lưu thay đổi" : "Đã lưu"}
          </Button>
        </div>
      }
    >
      {error ? <Alert tone="danger">{error}</Alert> : null}

      {/* Nút "Tải PDF" lấy bản ĐÃ LƯU, nên phải nói rõ khi bản nháp còn khác. */}
      {dirty ? (
        <Alert tone="info">
          Bản xem trước đang hiện thay đổi chưa lưu. Bấm “Lưu thay đổi” trước khi
          tải PDF.
        </Alert>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)]">
        <div className="space-y-3">
          <Tabs tabs={TABS} value={tab} onChange={setTab} />

          {tab === "noi-dung" ? (
            <CvEditor
              content={content}
              layout={layout}
              onContentChange={setContent}
              onLayoutChange={setLayout}
            />
          ) : (
            <CvTemplatePicker
              templateId={templateId}
              accent={accent}
              onTemplateChange={(id) => {
                setTemplateId(id);
                // Bỏ màu đang chọn: mỗi mẫu có màu mặc định riêng.
                setAccent(undefined);
              }}
              onAccentChange={setAccent}
            />
          )}
        </div>

        <div className="lg:sticky lg:top-4 lg:self-start">
          <CvPreview html={html} />
        </div>
      </div>
    </SectionCard>
  );
}
