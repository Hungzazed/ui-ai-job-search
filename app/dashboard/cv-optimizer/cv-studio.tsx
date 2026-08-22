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

  const [preview, setPreview] = useState<{ key: string; html: string } | null>(
    null,
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const draft = useMemo(
    () => ({ content, layout, templateId, accent }),
    [content, layout, templateId, accent],
  );

  // Gắn khoá vào bản đã tải rồi so lúc render: lượt tải cũ về muộn không đè được
  // lên bản nháp người dùng vừa gõ.
  const previewKey = `${record.id}|${JSON.stringify(draft)}`;
  const html = preview?.key === previewKey ? preview.html : null;

  useEffect(() => {
    let alive = true;
    const timer = setTimeout(() => {
      documentsService
        .previewDraft(record.id, draft)
        .then((body) => {
          if (alive) setPreview({ key: previewKey, html: body });
        })
        .catch((cause: unknown) => {
          if (alive)
            setError(apiErrorMessage(cause, "Không tải được bản xem trước"));
        });
    }, PREVIEW_DEBOUNCE_MS);

    return () => {
      alive = false;
      clearTimeout(timer);
    };
  }, [record.id, draft, previewKey]);

  const dirty = previewKey !== `${record.id}|${JSON.stringify(saved)}`;

  const handleSave = useCallback(async () => {
    setSaving(true);
    setError(null);
    try {
      await documentsService.updateCv(record.id, { content, layout });
      if (templateId !== saved.templateId || accent !== saved.accent) {
        await documentsService.setTemplate(record.id, templateId, accent);
      }
      onSaved();
    } catch (cause: unknown) {
      setError(apiErrorMessage(cause, "Không lưu được thay đổi"));
    } finally {
      setSaving(false);
    }
  }, [record.id, content, layout, templateId, accent, saved, onSaved]);

  const handleDownload = useCallback(async () => {
    setError(null);
    try {
      const blob = await documentsService.pdf(record.id, "html");
      const url = URL.createObjectURL(blob);
      window.open(url, "_blank", "noopener");
      // Thu hồi ngay thì tab vừa mở chưa kịp đọc xong blob.
      setTimeout(() => URL.revokeObjectURL(url), 60_000);
    } catch (cause: unknown) {
      setError(apiErrorMessage(cause, "Không tạo được PDF"));
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
