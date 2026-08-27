"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { FileText } from "lucide-react";
import type { JobMatchDetail, JobRecord, ProfileRecord } from "@/services";
import { apiErrorMessage, apiErrorStatus } from "@/lib/axios";
import { useApiQuery } from "@/hooks/use-api-query";
import { invalidateAfter, keys } from "@/lib/query-keys";
import {
  jobsService,
  matchesService,
  profileService,
  applicationsService,
} from "@/services";
import { toJobCard } from "@/lib/adapters";
import { Alert } from "@/components/ui/alert";
import { SectionCard } from "@/components/ui/section-card";
import { Skeleton, SkeletonPage } from "@/components/ui/skeleton";
import { Toast } from "@/components/ui/toast";
import { CompanyBriefPanel } from "./company-brief-panel";
import { JobDetailHeader } from "./job-detail-header";
import { InsightList } from "./match-insights";
import { MatchPanel } from "./match-panel";
import {
  MatchStreamError,
  streamMatchEvaluation,
  type PartialEvaluation,
} from "@/lib/match-stream";
const SCORE_POLL_MS = 2_500;
const SCORE_TIMEOUT_MS = 180_000;

interface JobDetailViewProps {
  jobId: string;
  embedded?: boolean;
}
interface JobDetailData {
  job: JobRecord;
  match: JobMatchDetail | null;
  profile: ProfileRecord | null;
}

export function JobDetailView({ jobId, embedded }: JobDetailViewProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [scoring, setScoring] = useState(false);
  const [partial, setPartial] = useState<PartialEvaluation | null>(null);
  const [savePending, setSavePending] = useState<boolean | null>(null);
  const [toast, setToast] = useState(false);
  const [appliedId, setAppliedId] = useState<string | null>(null);

  const key = keys.job(jobId);
  const { data, error } = useApiQuery(
    key,
    async () => {
      const [record, current, appList] = await Promise.all([
        jobsService.get(jobId),
        profileService.get().catch(() => null),
        applicationsService.list(undefined, { limit: 100, offset: 0 }).catch(() => null),
      ]);
      const existingApp = appList?.items.find((a: { jobId: string }) => a.jobId === jobId);
      return {
        job: record,
        match: record.match,
        profile: current,
        existingApplication: existingApp ?? null,
      };
    },
    { errorMessage: "Không tải được thông tin công việc" },
  );

  const job = data?.job ?? null;
  const match = data?.match ?? null;
  const profile = data?.profile ?? null;
  const existingApplication = data?.existingApplication ?? null;
  const saved = savePending ?? job?.saved ?? false;
  const toggleSave = () => {
    const next = !saved;
    setSavePending(next);
    void (next ? jobsService.save(jobId) : jobsService.unsave(jobId))
      .then(() => {
        invalidateAfter(queryClient, "saveJob");
        setSavePending(null);
      })
      .catch(() => setSavePending(!next));
  };
  const applyMatch = (next: JobMatchDetail) =>
    queryClient.setQueryData(key, (current: JobDetailData | undefined) =>
      current ? { ...current, match: next } : current,
    );

  const scoreByQueue = async (force: boolean) => {
    await matchesService.evaluate(jobId, force);
    const started = Date.now();
    while (Date.now() - started < SCORE_TIMEOUT_MS) {
      await new Promise((done) => setTimeout(done, SCORE_POLL_MS));
      const next = await matchesService.get(jobId).catch(() => null);
      if (next && next.status !== "PENDING" && next.status !== "RUNNING") {
        applyMatch(next as JobMatchDetail);
        return;
      }
    }
  };

  const handleScore = (force: boolean) => {
    setScoring(true);
    setPartial(null);
    void (async () => {
      try {
        const match = await streamMatchEvaluation({
          jobId,
          force,
          onPartial: setPartial,
        });
        applyMatch(match as unknown as JobMatchDetail);
      } catch (err) {
        if (apiErrorStatus(err) === 401) {
          router.replace(`/login?next=/dashboard/jobs/${jobId}`);
          return;
        }
        try {
          await scoreByQueue(force);
        } catch (fallbackError) {
          if (apiErrorStatus(fallbackError) === 401)
            router.replace(`/login?next=/dashboard/jobs/${jobId}`);
        }
        if (!(err instanceof MatchStreamError)) throw err;
      } finally {
        setScoring(false);
        setPartial(null);
      }
    })();
  };

  const hasApplied = existingApplication !== null;

  const handleApply = async () => {
    if (hasApplied) {
      if (job?.url) window.open(job.url, "_blank", "noopener");
      return;
    }
    try {
      const result = await applicationsService.create(jobId, { skipDocuments: true });
      setAppliedId(result.id);
      invalidateAfter(queryClient, "applicationStatus");
      if (job?.url) window.open(job.url, "_blank", "noopener");
      setToast(true);
    } catch (err) {
      if (apiErrorStatus(err) === 401) {
        router.replace(`/login?next=/dashboard/jobs/${jobId}`);
        return;
      }
      if (job?.url) window.open(job.url, "_blank", "noopener");
    }
  };

  const handleMarkApplied = async () => {
    if (!appliedId) return;
    try {
      await applicationsService.updateStatus(appliedId, "APPLIED");
      invalidateAfter(queryClient, "applicationStatus");
      setToast(false);
    } catch {}
  };

  if (error) return <Alert tone="danger">{error}</Alert>;

  if (!job) return <JobDetailSkeleton />;
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
      {toast && (
        <Toast
          message={
            <span>
              Việc làm này đã được chuyển sang trạng thái Đang tiến hành trong{" "}
              <button
                type="button"
                onClick={handleMarkApplied}
                className="font-medium text-primary-600 underline hover:text-primary-700"
              >
                Đã nhấp vào ứng tuyển
              </button>
              .
            </span>
          }
          onClose={() => setToast(false)}
        />
      )}
      <JobDetailHeader
        card={card}
        job={job}
        match={match}
        saved={saved}
        onToggleSave={toggleSave}
        onApply={handleApply}
      />

      <div
        className={
          embedded ? "space-y-6" : "grid gap-6 lg:grid-cols-3"
        }
      >
        
        {embedded && (
          <MatchPanel
            jobId={jobId}
            match={match}
            partial={partial}
            profile={profile}
            system={job.systemMatch}
            onScore={handleScore}
            scoring={scoring}
          />
        )}

        <div className={embedded ? "space-y-6" : "space-y-6 lg:col-span-2"}>
          <SectionCard
            icon={FileText}
            title="Mô tả công việc"
            description="Nội dung nguyên văn từ tin tuyển dụng gốc"
          >
            
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
        </div>
        <div className="space-y-6">
          <CompanyBriefPanel jobId={jobId} />
          {!embedded && (
            <MatchPanel
              jobId={jobId}
              match={match}
            partial={partial}
              profile={profile}
              system={job.systemMatch}
              onScore={handleScore}
              scoring={scoring}
            />
          )}
        </div>
      </div>
    </div>
  );
}
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
