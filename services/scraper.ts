import { api } from "@/lib/axios";
import type { QueuedScrapeRun, WorkStatus } from "./types";

export interface ScrapeRunRecord {
  id: string;
  portal: string;
  status: WorkStatus;
  queries: string[];
  jobsFound: number;
  jobsNew: number;
  jobsQueued: number;
  error: string | null;
  startedAt: string;
  finishedAt: string | null;
}

export const scraperService = {
  portals: () =>
    api.get<{ portals: string[] }>("/scrape/portals").then((r) => r.data),

  history: () => api.get<ScrapeRunRecord[]>("/scrape/runs").then((r) => r.data),

  get: (id: string) =>
    api.get<ScrapeRunRecord>(`/scrape/runs/${id}`).then((r) => r.data),

  start: (portal = "itviec") =>
    api.post<QueuedScrapeRun>("/scrape", { portal }).then((r) => r.data),
};
