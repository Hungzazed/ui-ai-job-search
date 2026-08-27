"use client";

import { useState } from "react";
import { Plus } from "@phosphor-icons/react/ssr";
import type { CvContentInput, CvSectionKey } from "@/services";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/form";
import {
  CollapsibleEntry,
  Line,
  LinesField,
  Paragraph,
  replaceAt,
} from "./cv-fields";

interface FieldsProps {
  content: CvContentInput;
  onChange: (value: CvContentInput) => void;
}

export function SectionFields({
  sectionKey,
  content,
  onChange,
}: FieldsProps & { sectionKey: CvSectionKey }) {
  if (sectionKey === "profile") return <ProfileFields {...{ content, onChange }} />;
  if (sectionKey === "competencies")
    return <CompetencyFields {...{ content, onChange }} />;
  if (sectionKey === "experience")
    return <ExperienceFields {...{ content, onChange }} />;
  if (sectionKey === "projects") return <ProjectFields {...{ content, onChange }} />;
  if (sectionKey === "education")
    return <EducationFields {...{ content, onChange }} />;
  if (sectionKey === "skills") return <SkillFields {...{ content, onChange }} />;
  return null;
}

function ProfileFields({ content, onChange }: FieldsProps) {
  return (
    <Textarea
      rows={8}
      value={content.profileStatement}
      placeholder="Vài câu giới thiệu bản thân"
      onChange={(event) =>
        onChange({ ...content, profileStatement: event.target.value })
      }
    />
  );
}

function CompetencyFields({ content, onChange }: FieldsProps) {
  return (
    <LinesField
      label="Năng lực"
      rows={5}
      value={content.coreCompetencies}
      onChange={(coreCompetencies) => onChange({ ...content, coreCompetencies })}
    />
  );
}

function useOpenEntry(count: number) {
  const [open, setOpen] = useState(count > 0 ? 0 : -1);
  const toggle = (index: number) => setOpen(open === index ? -1 : index);
  return { open, setOpen, toggle };
}

function ExperienceFields({ content, onChange }: FieldsProps) {
  const list = content.experiences;
  const { open, setOpen, toggle } = useOpenEntry(list.length);
  const update = (experiences: CvContentInput["experiences"]) =>
    onChange({ ...content, experiences });

  return (
    <div className="space-y-2">
      {list.map((experience, index) => (
        <CollapsibleEntry
          key={index}
          title={experience.position}
          subtitle={experience.company}
          open={open === index}
          onToggle={() => toggle(index)}
          onRemove={() => update(list.filter((_, at) => at !== index))}
        >
          <Line
            label="Chức danh"
            value={experience.position}
            onChange={(position) =>
              update(replaceAt(list, index, { ...experience, position }))
            }
          />
          <div className="grid gap-2 sm:grid-cols-2">
            <Line
              label="Công ty"
              value={experience.company}
              onChange={(company) =>
                update(replaceAt(list, index, { ...experience, company }))
              }
            />
            <Line
              label="Nơi làm"
              value={experience.location}
              onChange={(location) =>
                update(replaceAt(list, index, { ...experience, location }))
              }
            />
          </div>
          <Line
            label="Thời gian"
            value={experience.period}
            onChange={(period) =>
              update(replaceAt(list, index, { ...experience, period }))
            }
          />
          <LinesField
            label="Việc đã làm"
            rows={4}
            value={experience.bullets}
            onChange={(bullets) =>
              update(replaceAt(list, index, { ...experience, bullets }))
            }
          />
        </CollapsibleEntry>
      ))}
      <AddButton
        label="Thêm kinh nghiệm"
        onClick={() => {
          update([
            ...list,
            { position: "", company: "", location: "", period: "", bullets: [] },
          ]);
          setOpen(list.length);
        }}
      />
    </div>
  );
}

function ProjectFields({ content, onChange }: FieldsProps) {
  const list = content.projects;
  const { open, setOpen, toggle } = useOpenEntry(list.length);
  const update = (projects: CvContentInput["projects"]) =>
    onChange({ ...content, projects });

  return (
    <div className="space-y-2">
      {list.map((project, index) => (
        <CollapsibleEntry
          key={index}
          title={project.name}
          subtitle={project.organization}
          open={open === index}
          onToggle={() => toggle(index)}
          onRemove={() => update(list.filter((_, at) => at !== index))}
        >
          <Line
            label="Tên dự án"
            value={project.name}
            onChange={(name) =>
              update(replaceAt(list, index, { ...project, name }))
            }
          />
          <div className="grid gap-2 sm:grid-cols-2">
            <Line
              label="Vai trò"
              value={project.role}
              onChange={(role) =>
                update(replaceAt(list, index, { ...project, role }))
              }
            />
            <Line
              label="Tổ chức"
              value={project.organization}
              onChange={(organization) =>
                update(replaceAt(list, index, { ...project, organization }))
              }
            />
          </div>
          <Line
            label="Thời gian"
            value={project.period}
            onChange={(period) =>
              update(replaceAt(list, index, { ...project, period }))
            }
          />
          <Paragraph
            label="Dự án là gì"
            value={project.description}
            onChange={(description) =>
              update(replaceAt(list, index, { ...project, description }))
            }
          />
          <LinesField
            label="Đã làm gì"
            rows={3}
            value={project.bullets}
            onChange={(bullets) =>
              update(replaceAt(list, index, { ...project, bullets }))
            }
          />
          <LinesField
            label="Công cụ"
            value={project.tools}
            onChange={(tools) =>
              update(replaceAt(list, index, { ...project, tools }))
            }
          />
        </CollapsibleEntry>
      ))}
      <AddButton
        label="Thêm dự án"
        onClick={() => {
          update([
            ...list,
            {
              name: "",
              role: "",
              organization: "",
              period: "",
              description: "",
              bullets: [],
              tools: [],
            },
          ]);
          setOpen(list.length);
        }}
      />
    </div>
  );
}

function EducationFields({ content, onChange }: FieldsProps) {
  const list = content.educations;
  const { open, setOpen, toggle } = useOpenEntry(list.length);
  const update = (educations: CvContentInput["educations"]) =>
    onChange({ ...content, educations });

  return (
    <div className="space-y-2">
      {list.map((education, index) => (
        <CollapsibleEntry
          key={index}
          title={education.degree}
          subtitle={education.institution}
          open={open === index}
          onToggle={() => toggle(index)}
          onRemove={() => update(list.filter((_, at) => at !== index))}
        >
          <Line
            label="Bằng cấp"
            value={education.degree}
            onChange={(degree) =>
              update(replaceAt(list, index, { ...education, degree }))
            }
          />
          <div className="grid gap-2 sm:grid-cols-2">
            <Line
              label="Trường"
              value={education.institution}
              onChange={(institution) =>
                update(replaceAt(list, index, { ...education, institution }))
              }
            />
            <Line
              label="Thời gian"
              value={education.period}
              onChange={(period) =>
                update(replaceAt(list, index, { ...education, period }))
              }
            />
          </div>
          <Line
            label="Ghi chú"
            value={education.detail}
            onChange={(detail) =>
              update(replaceAt(list, index, { ...education, detail }))
            }
          />
        </CollapsibleEntry>
      ))}
      <AddButton
        label="Thêm học vấn"
        onClick={() => {
          update([
            ...list,
            { degree: "", institution: "", period: "", detail: "" },
          ]);
          setOpen(list.length);
        }}
      />
    </div>
  );
}

function SkillFields({ content, onChange }: FieldsProps) {
  const list = content.skillGroups;
  const { open, setOpen, toggle } = useOpenEntry(list.length);
  const update = (skillGroups: CvContentInput["skillGroups"]) =>
    onChange({ ...content, skillGroups });

  return (
    <div className="space-y-2">
      {list.map((group, index) => (
        <CollapsibleEntry
          key={index}
          title={group.label}
          subtitle={`${group.items.length} kỹ năng`}
          open={open === index}
          onToggle={() => toggle(index)}
          onRemove={() => update(list.filter((_, at) => at !== index))}
        >
          <Line
            label="Nhóm"
            value={group.label}
            onChange={(label) =>
              update(replaceAt(list, index, { ...group, label }))
            }
          />
          <LinesField
            label="Kỹ năng"
            value={group.items}
            onChange={(items) =>
              update(replaceAt(list, index, { ...group, items }))
            }
          />
        </CollapsibleEntry>
      ))}
      <AddButton
        label="Thêm nhóm kỹ năng"
        onClick={() => {
          update([...list, { label: "", items: [] }]);
          setOpen(list.length);
        }}
      />
    </div>
  );
}

export function AddButton({
  label,
  onClick,
}: {
  label: string;
  onClick: () => void;
}) {
  return (
    <Button size="sm" variant="outline" onClick={onClick} className="w-full">
      <Plus className="size-4" />
      {label}
    </Button>
  );
}
