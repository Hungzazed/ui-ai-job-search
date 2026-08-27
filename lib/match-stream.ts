import type { JobMatchWithJob } from "@/types";
import { streamModel } from "./model-stream";

export { ModelStreamError as MatchStreamError } from "./model-stream";

export interface PartialEvaluation {
  eligibility?: { verdict?: string; note?: string; quote?: string };
  technical?: { score?: number; note?: string };
  experience?: { score?: number; note?: string };
  behavioral?: { score?: number; note?: string };
  career?: { score?: number; note?: string };
  location?: { pass?: boolean; note?: string };
  strengths?: string[];
  gaps?: string[];
  recommendation?: string;
}

export interface StreamMatchOptions {
  jobId: string;
  onPartial: (partial: PartialEvaluation) => void;
  force?: boolean;
  signal?: AbortSignal;
}

export function streamMatchEvaluation({
  jobId,
  onPartial,
  force,
  signal,
}: StreamMatchOptions): Promise<JobMatchWithJob> {
  return streamModel<JobMatchWithJob, PartialEvaluation>({
    path: `/matches/evaluate-stream/${jobId}`,
    onPartial,
    force,
    signal,
  });
}
