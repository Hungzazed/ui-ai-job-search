"use client";

import { useState } from "react";
import { useDraftState } from "@/hooks/use-draft-state";
import { Clipboard, Sparkle } from "@phosphor-icons/react/ssr";
import type { JobMatchWithJob } from "@/types";
import type { ApplicationEmailInput } from "@/services";
import { JobSelect } from "@/components/dashboard/document-job";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea } from "@/components/ui/form";
import { SectionCard } from "@/components/ui/section-card";
import { Tabs } from "@/components/ui/tabs";

/** Sàn của backend cho JD dán tay. Giữ khớp với `CreateApplicationEmailDto`. */
const MIN_JD_LENGTH = 50;

type Source = "paste" | "pick";

const SOURCES = [
  { value: "paste", label: "Dán mô tả công việc" },
  { value: "pick", label: "Chọn tin đã có" },
];

/**
 * Chọn nguồn tin tuyển dụng cho mail: dán JD, hoặc lấy một tin đã chấm điểm.
 *
 * Dán JD là nhánh MẶC ĐỊNH, và đó là chủ ý: thao tác thật của người dùng là
 * copy mô tả từ một trang tuyển dụng bất kỳ rồi nhờ AI viết mail, chứ không
 * phải chờ tin đó được hệ thống quét về và chấm điểm xong.
 */
export function ApplicationEmailSourceCard({
  matches,
  fixedJobId,
  disabled,
  onSubmit,
}: {
  matches: JobMatchWithJob[];
  /** Vào từ trang chi tiết tin: khoá luôn vào tin đó, không cho đổi. */
  fixedJobId: string | null;
  disabled: boolean;
  onSubmit: (input: ApplicationEmailInput) => void;
}) {
  const [source, setSource] = useState<Source>(fixedJobId ? "pick" : "paste");
  const [jobId, setJobId] = useState(fixedJobId ?? "");

  /*
   * Ba ô này giữ qua việc đổi tab và tải lại trang. Đổi tab làm React tháo cả
   * panel, và một JD dài vừa dán mà biến mất thì người dùng phải đi copy lại từ
   * đầu - không cảnh báo, không hoàn tác.
   */
  const [jobDescription, setJobDescription] = useDraftState("email-jd");
  const [company, setCompany] = useDraftState("email-company");
  const [title, setTitle] = useDraftState("email-title");

  const jd = jobDescription.trim();
  const pasteReady =
    jd.length >= MIN_JD_LENGTH && company.trim() !== "" && title.trim() !== "";

  const handleSubmit = () => {
    if (disabled) return;
    if (source === "pick") {
      if (jobId) onSubmit({ jobId });
      return;
    }
    if (pasteReady) {
      onSubmit({
        jobDescription: jd,
        company: company.trim(),
        title: title.trim(),
      });
    }
  };

  return (
    <SectionCard
      compact
      icon={Clipboard}
      iconClassName="size-4"
      title="Tin tuyển dụng"
      description="Mail luôn viết cho một vị trí cụ thể. Dán mô tả công việc bạn copy được, hoặc chọn một tin hệ thống đã có."
      className="border-slate-200/90"
    >
      {!fixedJobId && (
        <Tabs
          tabs={SOURCES}
          value={source}
          onChange={(value) => setSource(value as Source)}
        />
      )}

      {source === "paste" ? (
        <div className="space-y-4">
          <div>
            <Label htmlFor="email-jd">Mô tả công việc (JD)</Label>
            <Textarea
              id="email-jd"
              rows={10}
              value={jobDescription}
              disabled={disabled}
              onChange={(event) => setJobDescription(event.target.value)}
              placeholder="Dán toàn bộ mô tả công việc vào đây: yêu cầu, mô tả công việc, quyền lợi…"
            />
            <p className="mt-1.5 text-xs text-slate-500">
              {jd.length < MIN_JD_LENGTH
                ? `Cần ít nhất ${MIN_JD_LENGTH} ký tự — càng đầy đủ thì mail càng bám đúng yêu cầu (đang có ${jd.length}).`
                : `${jd.length} ký tự. JD này không được lưu thành tin tuyển dụng, chỉ dùng để viết mail.`}
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="email-company">Công ty</Label>
              <Input
                id="email-company"
                value={company}
                disabled={disabled}
                onChange={(event) => setCompany(event.target.value)}
                placeholder="Công ty TNHH ABC"
              />
            </div>
            <div>
              <Label htmlFor="email-title">Vị trí ứng tuyển</Label>
              <Input
                id="email-title"
                value={title}
                disabled={disabled}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="Kế toán tổng hợp"
              />
            </div>
          </div>

          {/* Hai ô này người dùng tự gõ chứ không để model đọc ra từ JD: chúng
              đi thẳng vào tiêu đề mail và lời chào, mà đọc sai tên công ty ở đó
              thì lá mail hỏng theo cách khó chịu nhất. */}
          <p className="text-xs text-slate-500">
            Tên công ty và vị trí đi thẳng vào tiêu đề mail nên bạn tự điền, hệ
            thống không đoán từ JD.
          </p>
        </div>
      ) : (
        <JobSelect
          selectId="email-job"
          matches={matches}
          value={jobId}
          onChange={setJobId}
          disabled={disabled || Boolean(fixedJobId)}
          emptyOptionLabel="— Chọn một công việc —"
          hint={
            matches.length === 0
              ? "Chưa có công việc nào được chấm điểm. Dán JD ở tab bên cạnh thì không cần chờ."
              : undefined
          }
        />
      )}

      <div className="flex justify-end">
        <Button
          onClick={handleSubmit}
          loading={disabled}
          disabled={source === "pick" ? !jobId : !pasteReady}
        >
          <Sparkle className="size-4.5" />
          {disabled ? "Đang viết…" : "Viết mail ứng tuyển"}
        </Button>
      </div>
    </SectionCard>
  );
}
