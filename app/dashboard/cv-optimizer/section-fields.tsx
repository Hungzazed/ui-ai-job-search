"use client";

import { Plus } from "lucide-react";
import type { CvContentInput, CvSectionKey } from "@/services";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/form";
import { EntryBox, Line, LinesField, replaceAt } from "./cv-fields";

export function SectionFields({
  sectionKey,
  content,
  onChange,
}: {
  sectionKey: CvSectionKey;
  content: CvContentInput;
  onChange: (value: CvContentInput) => void;
}) {
  if (sectionKey === "profile") {
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

  if (sectionKey === "competencies") {
    return (
      <LinesField
        label="Năng lực"
        rows={5}
        value={content.coreCompetencies}
        onChange={(coreCompetencies) => onChange({ ...content, coreCompetencies })}
      />
    );
  }

  if (sectionKey === "experience") {
    const list = content.experiences;
    const update = (experiences: CvContentInput["experiences"]) =>
      onChange({ ...content, experiences });

    return (
      <div className="space-y-2">
        {list.map((experience, index) => (
          <EntryBox
            key={index}
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
              rows={8}
              value={experience.bullets}
              onChange={(bullets) =>
                update(replaceAt(list, index, { ...experience, bullets }))
              }
            />
          </EntryBox>
        ))}
        <AddButton
          label="Thêm kinh nghiệm"
          onClick={() =>
            update([
              ...list,
              {
                position: "",
                company: "",
                location: "",
                period: "",
                bullets: [],
              },
            ])
          }
        />
      </div>
    );
  }

  if (sectionKey === "education") {
    const list = content.educations;
    const update = (educations: CvContentInput["educations"]) =>
      onChange({ ...content, educations });

    return (
      <div className="space-y-2">
        {list.map((education, index) => (
          <EntryBox
            key={index}
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
          </EntryBox>
        ))}
        <AddButton
          label="Thêm học vấn"
          onClick={() =>
            update([
              ...list,
              { degree: "", institution: "", period: "", detail: "" },
            ])
          }
        />
      </div>
    );
  }

  const list = content.skillGroups;
  const update = (skillGroups: CvContentInput["skillGroups"]) =>
    onChange({ ...content, skillGroups });

  return (
    <div className="space-y-2">
      {list.map((group, index) => (
        <EntryBox
          key={index}
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
        </EntryBox>
      ))}
      <AddButton
        label="Thêm nhóm kỹ năng"
        onClick={() => update([...list, { label: "", items: [] }])}
      />
    </div>
  );
}

/** Nút thêm một mục con. */
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
