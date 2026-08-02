import type { Metadata } from "next";
import { jobs } from "@/lib/mock-data";
import { PageHeader } from "@/components/dashboard/page-header";
import { JobList } from "./job-list";

export const metadata: Metadata = { title: "Việc làm phù hợp — AI Career Agent" };

export default function JobsPage() {
  return (
    <div>
      <PageHeader
        title="Việc làm phù hợp"
        subtitle={`${jobs.length} việc làm được AI xếp hạng theo hồ sơ của bạn`}
      />
      <JobList jobs={jobs} />
    </div>
  );
}
