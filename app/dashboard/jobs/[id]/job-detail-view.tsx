"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { FileText } from "lucide-react";
import type { JobMatchWithJob } from "@/types";
import type { JobRecord, ProfileRecord } from "@/services";
import { apiErrorMessage, apiErrorStatus } from "@/lib/axios";
import { useApiQuery } from "@/hooks/use-api-query";
import {
  applicationsService,
  jobsService,
  matchesService,
  profileService,
} from "@/services";
import { toJobCard } from "@/lib/adapters";
import { Alert } from "@/components/ui/alert";
import { SectionCard } from "@/components/ui/section-card";
import { Skeleton, SkeletonPage } from "@/components/ui/skeleton";
import { JobDetailHeader } from "./job-detail-header";
import { InsightList } from "./match-insights";
import { MatchPanel } from "./match-panel";

/** Nhịp hỏi lại sau khi xếp hàng chấm điểm. p50 của một lượt chấm là ~40 giây. */
const SCORE_POLL_MS = 5_000;
const SCORE_TIMEOUT_MS = 180_000;

interface JobDetailViewProps {
  jobId: string;
}

/** Ba nguồn của màn này, gộp làm một mục cache để chúng luôn khớp nhau. */
interface JobDetailData {
  job: JobRecord;
  match: JobMatchWithJob | null;
  profile: ProfileRecord | null;
}

export function JobDetailView({ jobId }: JobDetailViewProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [applying, setApplying] = useState(false);
  const [applyError, setApplyError] = useState<string | null>(null);
  const [applied, setApplied] = useState(false);
  const [scoring, setScoring] = useState(false);
  /** Ý muốn của người dùng khi vừa bấm Lưu, chưa kịp có xác nhận từ máy chủ. */
  const [savePending, setSavePending] = useState<boolean | null>(null);

  const key = ["job", jobId];
  const { data, error } = useApiQuery(
    key,
    async () => {
      const [record, evaluation, current] = await Promise.all([
        jobsService.get(jobId),
        // 404 ở đây nghĩa là công việc chưa được chấm, không phải hỏng hóc.
        // Nuốt riêng mã này để phần mô tả công việc vẫn hiện ra bình thường.
        matchesService.get(jobId).catch((err: unknown) => {
          if (apiErrorStatus(err) === 404) return null;
          throw err;
        }),
        // Chỉ để hiện "chấm theo hồ sơ nào". Hỏng thì bỏ dòng đó, đừng làm
        // hỏng cả trang vì một chú thích.
        profileService.get().catch(() => null),
      ]);
      return { job: record, match: evaluation, profile: current };
    },
    { errorMessage: "Không tải được thông tin công việc" },
  );

  const job = data?.job ?? null;
  const match = data?.match ?? null;
  const profile = data?.profile ?? null;
  const saved = savePending ?? job?.saved ?? false;

  /**
   * Đổi trạng thái nút trước rồi mới gọi API, và hoàn lại nếu hỏng: nút Lưu
   * phải phản hồi tức thì, nhưng không được nói dối về sự thật ở máy chủ.
   *
   * Ý muốn giữ ở `savePending` chứ không ghi đè dữ liệu trong cache: cache là
   * câu trả lời của máy chủ, còn đây là điều người dùng vừa bấm mà máy chủ chưa
   * xác nhận. Trộn hai thứ vào một chỗ thì một lượt nạp lại nền sẽ lặng lẽ lật
   * ngược cái nút.
   */
  const toggleSave = () => {
    const next = !saved;
    setSavePending(next);
    void (next ? jobsService.save(jobId) : jobsService.unsave(jobId))
      .then(async () => {
        await queryClient.invalidateQueries({ queryKey: key });
        setSavePending(null);
      })
      .catch(() => setSavePending(!next));
  };

  /** Xếp hàng chấm điểm rồi hỏi lại tới khi worker xong. */
  const handleScore = (force: boolean) => {
    setScoring(true);
    void (async () => {
      try {
        await matchesService.evaluate(jobId, force);
        const started = Date.now();
        while (Date.now() - started < SCORE_TIMEOUT_MS) {
          await new Promise((done) => setTimeout(done, SCORE_POLL_MS));
          const next = await matchesService.get(jobId).catch(() => null);
          if (next && next.status !== "PENDING" && next.status !== "RUNNING") {
            // Ghi thẳng vào cache thay vì giữ một bản sao trong state: màn danh
            // sách đọc cùng khoá này, nên điểm mới có mặt ở cả hai nơi.
            queryClient.setQueryData(
              key,
              (current: JobDetailData | undefined) =>
                current ? { ...current, match: next } : current,
            );
            break;
          }
        }
      } catch (err) {
        if (apiErrorStatus(err) === 401) router.replace(`/login?next=/dashboard/jobs/${jobId}`);
      } finally {
        setScoring(false);
      }
    })();
  };

  const handleApply = async () => {
    setApplying(true);
    setApplyError(null);
    try {
      await applicationsService.create(jobId);
      setApplied(true);
      router.push("/dashboard/applications");
    } catch (err) {
      if (apiErrorStatus(err) === 401) {
        router.replace(`/login?next=/dashboard/jobs/${jobId}`);
        return;
      }
      setApplyError(apiErrorMessage(err, "Không tạo được đơn ứng tuyển"));
      setApplying(false);
    }
  };

  if (error) return <Alert tone="danger">{error}</Alert>;

  if (!job) return <JobDetailSkeleton />;

  // Dùng lại bộ chuyển đổi của thẻ công việc để lương, địa điểm và ngày đăng
  // hiển thị giống hệt danh sách. Điểm số thì lấy thẳng từ `match` bên dưới,
  // vì `toJobCard` quy null thành 0 — chấp nhận được trên thẻ, nhưng ở trang
  // này 0% sẽ bị đọc thành một kết luận đánh giá.
  const card = toJobCard({
    jobId: job.id,
    status: match?.status ?? "PENDING",
    eligibility: match?.eligibility ?? null,
    eligibilityNote: match?.eligibilityNote ?? null,
    overallScore: match?.overallScore ?? null,
    verdict: match?.verdict ?? null,
    technicalScore: match?.technicalScore ?? null,
    experienceScore: match?.experienceScore ?? null,
    strengths: match?.strengths ?? [],
    gaps: match?.gaps ?? [],
    job,
  });

  return (
    <div className="space-y-6">
      <JobDetailHeader
        card={card}
        job={job}
        match={match}
        saved={saved}
        onToggleSave={toggleSave}
        onApply={() => void handleApply()}
        applying={applying}
        applied={applied}
        applyError={applyError}
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <SectionCard
            icon={FileText}
            title="Mô tả công việc"
            description="Nội dung nguyên văn từ tin tuyển dụng gốc"
          >
            {/* Backend lưu mô tả dạng văn bản thuần, xuống dòng là ngắt đoạn
                duy nhất còn lại — giữ chúng thay vì dồn thành một khối chữ. */}
            <p className="text-sm leading-relaxed whitespace-pre-line text-slate-600">
              {job.description}
            </p>
          </SectionCard>

          {match && match.strengths.length > 0 && (
            <InsightList
              tone="positive"
              title="Điểm mạnh của bạn"
              description="Những điểm khiến AI đánh giá bạn nổi bật so với JD"
              items={match.strengths}
            />
          )}

          {match && match.gaps.length > 0 && (
            <InsightList
              tone="caution"
              title="Khoảng cách so với yêu cầu"
              description="Gợi ý để tăng điểm phù hợp cho lần ứng tuyển sau"
              items={match.gaps}
            />
          )}

          {/* Chỉ hiện khi tin có link: không có link thì không có gì để mở, và một
              nút bấm vào rồi báo lỗi tệ hơn là không có nút. */}
        </div>

        <MatchPanel
          jobId={jobId}
          match={match}
          profile={profile}
          system={job.systemMatch}
          onScore={handleScore}
          scoring={scoring}
        />
      </div>
    </div>
  );
}

/** Khung xám giữ đúng bố cục trang thật, để nội dung không nhảy khi tải xong. */
function JobDetailSkeleton() {
  return (
    <SkeletonPage>
      <Skeleton className="h-44 rounded-2xl" />
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Skeleton className="h-64" />
          <Skeleton className="h-48" />
        </div>
        <div className="space-y-6">
          <Skeleton className="h-56" />
          <Skeleton className="h-40" />
        </div>
      </div>
    </SkeletonPage>
  );
}
