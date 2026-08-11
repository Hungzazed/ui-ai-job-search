"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type {
  Application,
  ApplicationStatus,
  JobMatchWithJob,
} from "@/types";
import { apiErrorMessage, apiErrorStatus } from "@/lib/axios";
import { applicationsService, matchesService } from "@/services";
import { PageHeader } from "@/components/dashboard/page-header";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Stepper } from "@/components/ui/stepper";
import { ApplySkeleton } from "./apply-skeleton";
import { ConfirmStep } from "./confirm-step";
import { JobPicker } from "./job-picker";
import { refusalKind, type Refusal } from "./refusal";
import { SuccessStep } from "./success-step";

const LOGIN_NEXT = "/login?next=/dashboard/applications/apply";

/** Đủ rộng để người dùng thấy hết việc đáng nộp, đủ hẹp để không kéo cả bảng về. */
const PAGE_SIZE = 50;

/** Đủ lâu để đọc hết đoạn báo "đang soạn CV", chưa đủ lâu để thấy trang bị treo. */
const REDIRECT_DELAY_MS = 5000;

/**
 * Ba bước, không phải năm.
 *
 * `POST /api/applications` chỉ nhận `jobId`. Bản mock trước đây còn hỏi CV nào,
 * họ tên, điện thoại, mức lương mong muốn — không trường nào trong số đó tới
 * được backend, nên hỏi là nói dối người dùng rằng câu trả lời của họ có tác
 * dụng. CV và thư xin việc do worker tự sinh từ hồ sơ đã lưu.
 */
const STEPS = [
  { label: "Chọn việc làm" },
  { label: "Xác nhận" },
  { label: "Hoàn tất" },
];

export function ApplyView() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [matches, setMatches] = useState<JobMatchWithJob[] | null>(null);
  /**
   * Việc nào đã có đơn, kèm trạng thái để hiện đúng nhãn. Giá trị null nghĩa là
   * biết chắc đã có đơn nhưng chưa biết trạng thái — xảy ra khi thông tin này
   * đến từ một lần 409 chứ không từ danh sách đơn.
   */
  const [applied, setApplied] = useState<Map<
    string,
    ApplicationStatus | null
  > | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [step, setStep] = useState(0);
  const [jobId, setJobId] = useState(searchParams.get("job") ?? "");
  const [submitting, setSubmitting] = useState(false);
  const [refusal, setRefusal] = useState<Refusal | null>(null);
  const [created, setCreated] = useState<Application | null>(null);

  // Hai lời gọi song song vì màn hình cần cả hai mới vẽ đúng được: danh sách
  // việc đã chấm để chọn, và danh sách đơn để biết việc nào đã nộp rồi.
  useEffect(() => {
    let cancelled = false;

    void (async () => {
      try {
        const [page, applications] = await Promise.all([
          matchesService.list({ limit: PAGE_SIZE }),
          applicationsService.list(),
        ]);
        if (cancelled) return;
        setMatches(page.items);
        setApplied(
          new Map(
            applications.items.map((application) => [
              application.jobId,
              application.status,
            ]),
          ),
        );
      } catch (err) {
        if (cancelled) return;
        if (apiErrorStatus(err) === 401) {
          router.replace(LOGIN_NEXT);
          return;
        }
        setError(
          apiErrorMessage(err, "Không tải được danh sách việc làm đã chấm điểm"),
        );
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [router]);

  // Đơn vừa tạo nằm ở Lịch sử ứng tuyển, còn màn hình này hết việc. Chờ một
  // nhịp để người dùng kịp đọc đoạn báo CV đang được soạn rồi mới chuyển.
  useEffect(() => {
    if (step !== 2) return;
    const timer = setTimeout(
      () => router.push("/dashboard/applications"),
      REDIRECT_DELAY_MS,
    );
    return () => clearTimeout(timer);
  }, [step, router]);

  if (error) return <Alert tone="danger">{error}</Alert>;

  if (!matches || !applied) return <ApplySkeleton />;

  const selected = matches.find((match) => match.jobId === jobId) ?? null;
  const selectedBlocked =
    !selected || selected.eligibility === "FAIL" || applied.has(selected.jobId);

  const submit = async () => {
    if (!selected) return;
    setSubmitting(true);
    setRefusal(null);
    try {
      const application = await applicationsService.create(selected.jobId);
      setCreated(application);
      setStep(2);
    } catch (err) {
      const status = apiErrorStatus(err);
      if (status === 401) {
        router.replace(LOGIN_NEXT);
        return;
      }

      const message = apiErrorMessage(err, "Không tạo được đơn ứng tuyển");
      const kind = refusalKind(status, message, selected.eligibility);

      // Ghi lại ngay vào dữ liệu đang hiển thị, để khi quay về bước chọn thì
      // thẻ việc đó đã mang đúng trạng thái mới — nếu không, người dùng bấm
      // lại đúng cái việc vừa bị từ chối và nhận y nguyên câu trả lời cũ.
      if (kind === "duplicate") {
        setApplied((current) =>
          new Map(current ?? []).set(selected.jobId, null),
        );
      }
      if (kind === "ineligible") {
        setMatches((current) =>
          current
            ? current.map((match) =>
              match.jobId === selected.jobId
                ? {
                  ...match,
                  eligibility: "FAIL",
                  eligibilityNote: match.eligibilityNote ?? message,
                }
                : match,
            )
            : current,
        );
      }

      setRefusal({ jobId: selected.jobId, kind, message });
    } finally {
      setSubmitting(false);
    }
  };

  const restart = () => {
    setStep(0);
    setJobId("");
    setCreated(null);
    setRefusal(null);
  };

  return (
    <div>
      <PageHeader
        title="Ứng tuyển"
        subtitle="Chọn một việc đã được chấm điểm, hệ thống tạo đơn và soạn hồ sơ cho vị trí đó"
      />

      <Card className="mb-6 p-5">
        <Stepper
          steps={STEPS}
          current={step}
          // Không cho quay lại từ bước Hoàn tất: đơn đã tạo rồi, bấm lại chỉ
          // dẫn tới một lần 409.
          onStepClick={(index) => step < 2 && index < step && setStep(index)}
        />
      </Card>

      {step === 0 && (
        <JobPicker
          matches={matches}
          applied={applied}
          selectedId={jobId}
          onSelect={setJobId}
        />
      )}

      {step === 1 && selected && (
        <ConfirmStep selected={selected} refusal={refusal} />
      )}

      {step === 2 && created && (
        <SuccessStep created={created} onRestart={restart} />
      )}

      {step < 2 && (
        <div className="mt-6 flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => setStep(0)}
            disabled={step === 0}
          >
            ← Quay lại
          </Button>
          {step === 0 ? (
            <Button onClick={() => setStep(1)} disabled={selectedBlocked}>
              Tiếp tục →
            </Button>
          ) : (
            <Button onClick={() => void submit()} loading={submitting}>
              Tạo đơn ứng tuyển
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
