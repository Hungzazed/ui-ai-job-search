import { GraduationCap, Layers, Sparkles, Target } from "lucide-react";
import type { CvContent } from "@/lib/document-content";
import { Badge } from "@/components/ui/badge";
import { SectionTitle } from "@/components/ui/section-title";

/** Ghép các mảnh có thật thành một dòng "A · B · C", bỏ qua mảnh thiếu. */
const joinParts = (parts: Array<string | null | undefined>): string =>
  parts.filter((part): part is string => Boolean(part)).join(" · ");

/**
 * Vẽ nội dung CV đã phân tích.
 *
 * Mỗi khối tự ẩn khi rỗng: model có thể trả về thiếu bất kỳ phần nào, và một
 * tiêu đề "Học vấn" đứng trên khoảng trắng đọc như dữ liệu bị mất chứ không như
 * dữ liệu chưa có.
 */
export function CvContentView({ cv }: { cv: CvContent }) {
  return (
    <>
      {cv.profileStatement && (
        <section>
          <SectionTitle
            icon={<Target className="size-3.5" />}
            label="Giới thiệu"
          />
          <p className="text-sm leading-relaxed text-slate-700">
            {cv.profileStatement}
          </p>
        </section>
      )}

      {cv.coreCompetencies.length > 0 && (
        <section>
          <SectionTitle
            icon={<Sparkles className="size-3.5" />}
            label="Năng lực cốt lõi"
          />
          <ul className="space-y-1.5">
            {cv.coreCompetencies.map((item) => (
              <li key={item} className="flex gap-2 text-sm text-slate-700">
                <span className="bg-primary-400 mt-1.5 size-1.5 shrink-0 rounded-full" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {cv.experiences.length > 0 && (
        <section>
          <SectionTitle
            icon={<Layers className="size-3.5" />}
            label="Kinh nghiệm làm việc"
          />
          <div className="space-y-4">
            {cv.experiences.map((experience, index) => (
              <div
                key={`${experience.company ?? ""}-${experience.position ?? ""}-${index}`}
                className="border-l-2 border-slate-200 pl-3.5"
              >
                <p className="text-sm font-semibold text-slate-900">
                  {experience.position ?? experience.company}
                </p>
                <p className="font-mono text-[11px] text-slate-500">
                  {joinParts([
                    experience.position ? experience.company : null,
                    experience.location,
                    experience.period,
                  ])}
                </p>
                {experience.bullets.length > 0 && (
                  <ul className="mt-2 space-y-1.5">
                    {experience.bullets.map((bullet) => (
                      <li
                        key={bullet}
                        className="flex gap-2 text-xs leading-relaxed text-slate-600"
                      >
                        <span className="mt-1.5 size-1 shrink-0 rounded-full bg-slate-400" />
                        <span>{bullet}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {cv.educations.length > 0 && (
        <section>
          <SectionTitle
            icon={<GraduationCap className="size-3.5" />}
            label="Học vấn"
          />
          <div className="space-y-3">
            {cv.educations.map((education, index) => (
              <div key={`${education.institution ?? ""}-${index}`}>
                <p className="text-sm font-medium text-slate-900">
                  {education.degree ?? education.institution}
                </p>
                <p className="font-mono text-[11px] text-slate-500">
                  {joinParts([
                    education.degree ? education.institution : null,
                    education.period,
                  ])}
                </p>
                {education.detail && (
                  <p className="mt-1 text-xs leading-relaxed text-slate-600">
                    {education.detail}
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {cv.skillGroups.length > 0 && (
        <section>
          <SectionTitle
            icon={<Layers className="size-3.5" />}
            label="Kỹ năng"
          />
          <div className="space-y-2.5">
            {cv.skillGroups.map((group, index) => (
              <div
                key={`${group.label ?? ""}-${index}`}
                className="flex flex-wrap items-center gap-2"
              >
                {group.label && (
                  <span className="font-mono text-[11px] font-semibold text-slate-500">
                    {group.label}:
                  </span>
                )}
                {group.items.map((item) => (
                  <Badge key={item} variant="outline" className="text-[11px]">
                    {item}
                  </Badge>
                ))}
              </div>
            ))}
          </div>
        </section>
      )}
    </>
  );
}
