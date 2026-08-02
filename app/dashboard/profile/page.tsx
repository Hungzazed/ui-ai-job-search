"use client";

import { useState } from "react";
import {
  Award,
  Briefcase,
  CheckCircle2,
  Code2,
  FileText,
  FolderGit2,
  GraduationCap,
  PenLine,
  Share2,
  Sparkles,
  UserRound,
} from "lucide-react";
import { currentUser } from "@/lib/mock-data";
import { PageHeader } from "@/components/dashboard/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { CompanyLogo } from "@/components/dashboard/company-logo";
import { cn } from "@/lib/utils";
import type { ConnectionSourceType, SkillLevel } from "@/types";

const tabs = [
  { value: "overview", label: "Tổng quan" },
  { value: "skills", label: "Kỹ năng" },
  { value: "experience", label: "Kinh nghiệm" },
  { value: "projects", label: "Dự án" },
  { value: "education", label: "Học vấn" },
  { value: "certificates", label: "Chứng chỉ" },
  { value: "activities", label: "Hoạt động" },
];

const sourceMeta: Record<ConnectionSourceType, { icon: typeof Code2; color: string; bg: string }> = {
  cv: { icon: FileText, color: "text-rose-500", bg: "bg-rose-50" },
  github: { icon: Code2, color: "text-slate-800", bg: "bg-slate-100" },
  linkedin: { icon: Share2, color: "text-sky-600", bg: "bg-sky-50" },
  manual: { icon: PenLine, color: "text-primary-600", bg: "bg-primary-50" },
};

const levelLabels: Record<SkillLevel, string> = {
  beginner: "Cơ bản",
  intermediate: "Trung cấp",
  advanced: "Nâng cao",
  expert: "Chuyên sâu",
};

const levelPercent: Record<SkillLevel, number> = {
  beginner: 30,
  intermediate: 55,
  advanced: 75,
  expert: 95,
};

export default function ProfilePage() {
  const [tab, setTab] = useState("overview");

  return (
    <div className="space-y-6">
      <PageHeader
        title="Hồ sơ của tôi"
        subtitle="Quản lý thông tin cá nhân, kết nối nguồn dữ liệu và xem hồ sơ đã được AI parse"
        actions={
          <>
            <Button variant="outline">Chia sẻ hồ sơ</Button>
            <Button>
              <Sparkles className="size-4" />
              Tối ưu bằng AI
            </Button>
          </>
        }
      />

      {/* Data sources */}
      <section>
        <h2 className="mb-3 text-sm font-semibold text-slate-700">Nguồn dữ liệu kết nối</h2>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {currentUser.connections.map((source) => {
            const meta = sourceMeta[source.type];
            const Icon = meta.icon;
            const connected = source.status === "connected";
            return (
              <Card key={source.id} className="p-4">
                <div className="flex items-start justify-between">
                  <div className={cn("flex size-10 items-center justify-center rounded-xl", meta.bg, meta.color)}>
                    <Icon className="size-5" />
                  </div>
                  <Badge variant={connected ? "success" : "warning"}>
                    {connected ? "Đã kết nối" : "Chưa kết nối"}
                  </Badge>
                </div>
                <p className="mt-3 text-sm font-semibold text-slate-900">{source.label}</p>
                <p className="mt-0.5 text-xs text-slate-400">{source.detail}</p>
                <Button variant={connected ? "outline" : "primary"} size="sm" className="mt-3 w-full">
                  {connected ? "Đồng bộ lại" : "Kết nối"}
                </Button>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Tabs */}
      <Tabs tabs={tabs} value={tab} onChange={setTab} />

      {tab === "overview" && (
        <div className="grid gap-4 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Hồ sơ AI đã parse</CardTitle>
              <CardDescription>
                Dữ liệu JSON được AI trích xuất từ CV PDF & GitHub — dùng để tính điểm match
              </CardDescription>
            </CardHeader>
            <CardContent>
              <pre className="scrollbar-thin max-h-105 overflow-auto rounded-xl bg-slate-950 p-4 text-xs leading-relaxed text-emerald-300">
{`{
  "profile": {
    "full_name": "${currentUser.name}",
    "title": "${currentUser.title}",
    "location": "${currentUser.location}",
    "email": "${currentUser.email}",
    "summary": "Frontend Engineer 4+ năm, chuyên React/TypeScript/Next.js...",
    "years_of_experience": 4.2,
    "total_skills": ${currentUser.skills.length},
    "top_skills": ["React", "TypeScript", "Next.js", "Tailwind CSS"],
    "github_repos_analyzed": 68,
    "languages": ["TypeScript", "JavaScript", "HTML", "CSS"],
    "ai_confidence": 0.96
  },
  "completeness": {
    "score": ${currentUser.profileCompletion},
    "missing": ["Chứng chỉ mới hơn 2024", "Project KPI chi tiết"]
  }
}`}
              </pre>
            </CardContent>
          </Card>

          <div className="space-y-4">
            <Card className="p-5">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-slate-500">Độ hoàn thiện</p>
                <Badge variant="primary">{currentUser.profileCompletion}%</Badge>
              </div>
              <Progress value={currentUser.profileCompletion} className="mt-3" />
              <p className="mt-2 text-xs text-slate-400">
                Thêm chứng chỉ & số liệu dự án để đạt 100%
              </p>
            </Card>
            <Card className="p-5">
              <div className="flex items-center gap-3">
                <div className="flex size-12 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-primary-600 text-sm font-bold text-white">
                  {currentUser.initials}
                </div>
                <div>
                  <p className="font-semibold text-slate-900">{currentUser.name}</p>
                  <p className="text-xs text-slate-400">{currentUser.title}</p>
                </div>
              </div>
              <div className="mt-4 space-y-2 text-sm text-slate-500">
                <p>📍 {currentUser.location}</p>
                <p>📧 {currentUser.email}</p>
                <p>📞 {currentUser.phone}</p>
              </div>
            </Card>
          </div>
        </div>
      )}

      {tab === "skills" && (
        <Card>
          <CardHeader>
            <CardTitle>Kỹ năng của bạn</CardTitle>
            <CardDescription>AI đánh giá dựa trên CV, GitHub và câu trả lời của bạn</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-x-8 gap-y-4 sm:grid-cols-2">
            {currentUser.skills.map((skill) => (
              <div key={skill.name} className="flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-slate-800">{skill.name}</p>
                  <p className="text-xs text-slate-400">{levelLabels[skill.level]}</p>
                </div>
                <Progress value={levelPercent[skill.level]} className="max-w-40" />
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {tab === "experience" && (
        <div className="space-y-4">
          {currentUser.experiences.map((exp) => (
            <Card key={exp.id} className="p-5">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-xl bg-primary-50 text-primary-600">
                    <Briefcase className="size-5" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">{exp.position}</p>
                    <p className="text-sm text-slate-500">
                      {exp.company} · {exp.location}
                    </p>
                  </div>
                </div>
                <Badge variant="neutral">{exp.period}</Badge>
              </div>
              <ul className="mt-4 space-y-1.5 text-sm text-slate-600">
                {exp.highlights.map((item) => (
                  <li key={item} className="flex gap-2">
                    <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-500" />
                    {item}
                  </li>
                ))}
              </ul>
            </Card>
          ))}
        </div>
      )}

      {tab === "projects" && (
        <div className="grid gap-4 lg:grid-cols-2">
          {currentUser.projects.map((project) => (
            <Card key={project.id} className="p-5">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                  <FolderGit2 className="size-5" />
                </div>
                <div>
                  <p className="font-semibold text-slate-900">{project.name}</p>
                  <p className="text-xs text-slate-400">{project.period}</p>
                </div>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-slate-600">{project.description}</p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {project.technologies.map((tech) => (
                  <Badge key={tech} variant="outline">{tech}</Badge>
                ))}
              </div>
            </Card>
          ))}
        </div>
      )}

      {tab === "education" && (
        <Card className="p-5">
          {currentUser.educations.map((edu) => (
            <div key={edu.id} className="flex flex-wrap items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-xl bg-sky-50 text-sky-600">
                  <GraduationCap className="size-5" />
                </div>
                <div>
                  <p className="font-semibold text-slate-900">{edu.school}</p>
                  <p className="text-sm text-slate-500">
                    {edu.degree} · {edu.field}
                    {edu.gpa ? ` · GPA ${edu.gpa}` : ""}
                  </p>
                </div>
              </div>
              <Badge variant="neutral">{edu.period}</Badge>
            </div>
          ))}
        </Card>
      )}

      {tab === "certificates" && (
        <Card className="divide-y divide-slate-100 p-5">
          {currentUser.certificates.map((cert) => (
            <div key={cert.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                <Award className="size-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-slate-900">{cert.name}</p>
                <p className="text-sm text-slate-500">
                  {cert.issuer} · {cert.year}
                </p>
              </div>
              <Badge variant="success">Verified</Badge>
            </div>
          ))}
        </Card>
      )}

      {tab === "activities" && (
        <div className="space-y-4">
          {currentUser.activities.map((activity) => (
            <Card key={activity.id} className="p-5">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                    <UserRound className="size-5" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">{activity.title}</p>
                    <p className="text-sm text-slate-500">{activity.description}</p>
                  </div>
                </div>
                <Badge variant="neutral">{activity.date}</Badge>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
