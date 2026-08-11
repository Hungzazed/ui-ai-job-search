import type { ProfileRecord, profileService } from "@/services";
import { joinList, parseList, toJsonText } from "@/utils";

/** Chỉ những trường `update()` nhận — id, userId, completion và mốc thời gian do backend giữ. */
export type ProfileUpdate = Parameters<typeof profileService.update>[0];

/**
 * Bản nháp đang gõ, mọi thứ đều là chuỗi.
 *
 * Mảng được gõ dạng "a, b, c" và khối JSON được gõ dạng văn bản, nên giữ nguyên
 * những gì người dùng gõ cho tới lúc bấm Lưu. Chuyển đổi sớm sẽ nuốt mất dấu
 * phẩy đang gõ dở hoặc JSON chưa đóng ngoặc.
 */
export interface ProfileDraft {
  headline: string;
  summary: string;
  location: string;
  country: string;
  citizenship: string;
  workPermit: string;
  employmentStatus: string;
  remotePreference: string;
  commuteConstraint: string;
  willingToRelocate: boolean;
  languages: string;
  primarySkills: string;
  secondarySkills: string;
  lackingSkills: string;
  directExperienceDomains: string;
  adjacentExperience: string;
  careerGoals: string;
  energizingTasks: string;
  drainingTasks: string;
  targetSectors: string;
  dealBreakers: string;
  experiences: string;
  educations: string;
  behavioralTraits: string;
}

/** Ghi một trường của bản nháp; các khối section dùng chung chữ ký này. */
export type UpdateDraft = <K extends keyof ProfileDraft>(
  key: K,
  value: ProfileDraft[K],
) => void;

/**
 * Chỉ những khoá mang giá trị chuỗi.
 *
 * Các section dựng ô nhập từ một mảng cấu hình; nếu khoá được gõ là
 * `keyof ProfileDraft` thì `willingToRelocate` (boolean) cũng lọt vào và mọi
 * lời gọi `update` phải ép kiểu. Lọc ngay ở kiểu thì không cần ép chỗ nào.
 */
export type ProfileTextKey = {
  [K in keyof ProfileDraft]: ProfileDraft[K] extends string ? K : never;
}[keyof ProfileDraft];

/** Một ô nhập khai báo bằng dữ liệu, để section chỉ còn là một vòng lặp. */
export interface DraftFieldSpec {
  key: ProfileTextKey;
  label: string;
  placeholder: string;
  hint?: string;
}

export interface ProfileSectionProps {
  draft: ProfileDraft;
  update: UpdateDraft;
}

const TEXT_FIELDS = [
  "headline",
  "summary",
  "location",
  "country",
  "citizenship",
  "workPermit",
  "employmentStatus",
  "remotePreference",
  "commuteConstraint",
] as const;

const LIST_FIELDS = [
  "languages",
  "primarySkills",
  "secondarySkills",
  "lackingSkills",
  "directExperienceDomains",
  "adjacentExperience",
  "careerGoals",
  "energizingTasks",
  "drainingTasks",
  "targetSectors",
  "dealBreakers",
] as const;

const JSON_FIELDS = ["experiences", "educations", "behavioralTraits"] as const;

/** Nhãn tiếng Việt để báo lỗi JSON chỉ đúng ô người dùng gõ sai. */
const JSON_LABELS: Record<(typeof JSON_FIELDS)[number], string> = {
  experiences: "Kinh nghiệm làm việc",
  educations: "Học vấn",
  behavioralTraits: "Đặc điểm hành vi",
};

export const PROFILE_TABS = [
  { value: "identity", label: "Định danh" },
  { value: "skills", label: "Kỹ năng" },
  { value: "career", label: "Định hướng" },
  { value: "conditions", label: "Điều kiện làm việc" },
  { value: "records", label: "Kinh nghiệm & Học vấn" },
];

export const toDraft = (profile: ProfileRecord): ProfileDraft => ({
  headline: profile.headline ?? "",
  summary: profile.summary ?? "",
  location: profile.location ?? "",
  country: profile.country ?? "",
  citizenship: profile.citizenship ?? "",
  workPermit: profile.workPermit ?? "",
  employmentStatus: profile.employmentStatus ?? "",
  remotePreference: profile.remotePreference ?? "",
  commuteConstraint: profile.commuteConstraint ?? "",
  willingToRelocate: profile.willingToRelocate,
  languages: joinList(profile.languages),
  primarySkills: joinList(profile.primarySkills),
  secondarySkills: joinList(profile.secondarySkills),
  lackingSkills: joinList(profile.lackingSkills),
  directExperienceDomains: joinList(profile.directExperienceDomains),
  adjacentExperience: joinList(profile.adjacentExperience),
  careerGoals: joinList(profile.careerGoals),
  energizingTasks: joinList(profile.energizingTasks),
  drainingTasks: joinList(profile.drainingTasks),
  targetSectors: joinList(profile.targetSectors),
  dealBreakers: joinList(profile.dealBreakers),
  experiences: toJsonText(profile.experiences),
  educations: toJsonText(profile.educations),
  behavioralTraits: toJsonText(profile.behavioralTraits),
});

/** Ghi có kiểu vào một khoá động — tránh phải ép kiểu cả object thay đổi. */
function assign<K extends keyof ProfileUpdate>(
  target: ProfileUpdate,
  key: K,
  value: ProfileUpdate[K],
): void {
  target[key] = value;
}

/**
 * Chỉ gom những trường thật sự khác so với hồ sơ đang có.
 *
 * PATCH gửi cả hồ sơ cũng chạy, nhưng khi hai tab cùng mở thì bản gửi sau sẽ
 * ghi đè thay đổi của bản trước bằng dữ liệu đã cũ. Gửi đúng phần đã sửa thì
 * không có chuyện đó.
 *
 * Ném lỗi khi một khối JSON gõ sai, vì lúc đó không có cách nào đoán được ý
 * người dùng — thà dừng lại còn hơn lưu nửa vời.
 */
export function buildChanges(
  draft: ProfileDraft,
  profile: ProfileRecord,
): ProfileUpdate {
  const changes: ProfileUpdate = {};

  for (const key of TEXT_FIELDS) {
    const next = draft[key].trim();
    if (next !== (profile[key] ?? "")) assign(changes, key, next);
  }

  for (const key of LIST_FIELDS) {
    const next = parseList(draft[key]);
    const previous = profile[key];
    const changed =
      next.length !== previous.length ||
      next.some((item, index) => item !== previous[index]);
    if (changed) assign(changes, key, next);
  }

  for (const key of JSON_FIELDS) {
    const text = draft[key].trim();
    // Ô trống được hiểu là "giữ nguyên", không phải "xoá": Prisma từ chối gán
    // null thẳng vào cột Json và sẽ trả lỗi 500. Muốn xoá thì gõ [] hoặc {}.
    if (!text || text === toJsonText(profile[key]).trim()) continue;
    try {
      assign(changes, key, JSON.parse(text) as unknown);
    } catch {
      throw new Error(`Khối "${JSON_LABELS[key]}" không phải JSON hợp lệ`);
    }
  }

  if (draft.willingToRelocate !== profile.willingToRelocate) {
    changes.willingToRelocate = draft.willingToRelocate;
  }

  return changes;
}
