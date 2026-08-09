"use client";

import Link from "next/link";
import { useState } from "react";
import { Bookmark, Calendar, MapPin, Sparkles } from "lucide-react";
import type { Job } from "@/types";
import { formatSalary, matchToneClasses } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CompanyLogo } from "@/components/dashboard/company-logo";
import { cn } from "@/lib/utils";

interface JobCardProps {
  job: Job;
  onSavedChange?: (jobId: string, saved: boolean) => void;
}

export function JobCard({ job, onSavedChange }: JobCardProps) {
  const [saved, setSaved] = useState(job.saved);
  const tone = matchToneClasses(job.aiMatch);

  const toggleSave = () => {
    const next = !saved;
    setSaved(next);
    onSavedChange?.(job.id, next);
  };

  return (
    <Card className="group transition-all duration-150 hover:border-slate-300 hover:shadow-xs">
      <CardContent className="p-4.5">
        <div className="flex items-start gap-3.5">
          <CompanyLogo initials={job.companyInitials} color={job.companyColor} size="lg" />

          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="text-xs font-medium text-slate-400">{job.company}</p>
                <Link
                  href={`/dashboard/jobs/${job.id}`}
                  className="mt-0.5 line-clamp-2 text-sm font-semibold tracking-tight text-slate-900 transition-colors hover:text-primary-600"
                >
                  {job.title}
                </Link>
              </div>
              <Badge className={cn("shrink-0 font-mono text-[11px] font-bold", tone.bg, tone.text)}>
                <Sparkles className="size-3 mr-0.5" />
                {job.aiMatch}% Match
              </Badge>
            </div>

            <div className="mt-2.5 flex flex-wrap items-center gap-x-3.5 gap-y-1 text-xs text-slate-500">
              <span className="font-mono font-semibold text-slate-800">{formatSalary(job.salary)}</span>
              <span className="inline-flex items-center gap-1">
                <MapPin className="size-3.5 text-slate-400" />
                {job.location}
              </span>
              <span className="inline-flex items-center gap-1">
                <Calendar className="size-3.5 text-slate-400" />
                {job.postedAt}
              </span>
            </div>

            <div className="mt-3 flex flex-wrap gap-1.5">
              {job.tags.map((tag) => (
                <Badge key={tag} variant="outline" className="text-[11px] text-slate-600 border-slate-200">
                  {tag}
                </Badge>
              ))}
            </div>

            <div className="mt-4 flex items-center justify-between border-t border-slate-100/90 pt-3">
              <Button size="sm" variant="outline" onClick={toggleSave} aria-label="Lưu việc làm">
                <Bookmark className={cn("size-3.5", saved && "fill-primary-600 text-primary-600")} />
                {saved ? "Đã lưu" : "Lưu"}
              </Button>
              <Link href={`/dashboard/jobs/${job.id}`}>
                <Button size="sm" variant="primary">Tối ưu & Ứng tuyển</Button>
              </Link>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
