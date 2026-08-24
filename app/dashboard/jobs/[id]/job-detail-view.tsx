"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { FileText } from "lucide-react";
import type { JobMatchWithJob } from "@/types";
import type { JobRecord, ProfileRecord } from "@/services";
import { apiErrorMessage, apiErrorStatus } from "@/lib/axios";
import { useApiQuery } from "@/hooks/use-api-query";
import { invalidateAfter, keys } from "@/lib/query-keys";
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
import { CompanyBriefPanel } from "./company-brief-panel";
import { JobDetailHeader } from "./job-detail-header";
import { InsightList } from "./match-insights";
import { MatchPanel } from "./match-panel";
const SCORE_POLL_MS = 5_000;
const SCORE_TIMEOUT_MS = 180_000;

interface JobDetailViewProps {
  jobId: string;
  embedded?: boolean;
}
interface JobDetailData {
  job: JobRecord;
  match: JobMatchWithJob | null;
  profile: ProfileRecord | null;
}

export function JobDetailView({ jobId, embedded }: JobDetailViewProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [applying, setApplying] = useState(false);
  const [applyError, setApplyError] = useState<string | null>(null);
  const [applied, setApplied] = useState(false);
  const [scoring, setScoring] = useState(false); 
  const [savePending, setSavePending] = useState<boolean | null>(null);

  const key = keys.job(jobId);
  const { data, error } = useApiQuery(
    key,
    async () => {
      const [record, evaluation, current] = await Promise.all([
        jobsService.get(jobId),
        matchesService.get(jobId).catch((err: unknown) => {
          if (apiErrorStatus(err) === 404) return null;
          throw err;
        }),
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

      <div
        className={
          embedded ? "space-y-6" : "grid gap-6 lg:grid-cols-3"
        }
      >
        
        {embedded && (
          <MatchPanel
            jobId={jobId}
            match={match}
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
