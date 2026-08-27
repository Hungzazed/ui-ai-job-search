/**
 * Đọc `DocumentRecord.content` — khối JSON do model sinh ra.
 *
 * Backend khai trường này là `unknown` và điều đó không phải sự lười biếng:
 * nội dung đi qua một lượt sinh của model rồi mới được ghi xuống, nên không có
 * gì bảo đảm nó đủ trường. Một lần chạy hỏng nửa chừng vẫn có thể để lại JSON
 * thiếu `experiences`, hoặc `bullets` là chuỗi thay vì mảng.
 *
 * Vì vậy ở đây KHÔNG ép kiểu (`as CvContent`). Mỗi trường được kiểm tra riêng,
 * thiếu hoặc sai kiểu thì bỏ qua đúng khối đó — giao diện mất một mục còn hơn
 * cả trang trắng vì `undefined.map`.
 *
 * Các hàm đọc cơ bản nằm ở `parse-json.ts` vì `interview-content.ts` cũng dùng
 * đúng bộ đó.
 */

import { isRecord, objectList, text, textList } from "./parse-json";

/* =========================================================
   CV
   ========================================================= */

export interface CvExperience {
  position: string | null;
  company: string | null;
  location: string | null;
  period: string | null;
  bullets: string[];
}

export interface CvProject {
  name: string | null;
  role: string | null;
  organization: string | null;
  period: string | null;
  description: string | null;
  bullets: string[];
  tools: string[];
}

export interface CvEducation {
  degree: string | null;
  institution: string | null;
  period: string | null;
  detail: string | null;
}

export interface CvSkillGroup {
  label: string | null;
  items: string[];
}

export interface CvContent {
  profileStatement: string | null;
  coreCompetencies: string[];
  experiences: CvExperience[];
  projects: CvProject[];
  educations: CvEducation[];
  skillGroups: CvSkillGroup[];
}

function parseExperience(value: unknown): CvExperience | null {
  if (!isRecord(value)) return null;
  const experience: CvExperience = {
    position: text(value.position),
    company: text(value.company),
    location: text(value.location),
    period: text(value.period),
    bullets: textList(value.bullets),
  };
  // Không có cả chức danh lẫn công ty thì khối này không nói lên điều gì.
  return experience.position || experience.company ? experience : null;
}

function parseCvProject(value: unknown): CvProject | null {
  if (!isRecord(value)) return null;
  const project: CvProject = {
    name: text(value.name),
    role: text(value.role),
    organization: text(value.organization),
    period: text(value.period),
    description: text(value.description),
    bullets: textList(value.bullets),
    tools: textList(value.tools),
  };
  return project.name || project.bullets.length > 0 ? project : null;
}

function parseEducation(value: unknown): CvEducation | null {
  if (!isRecord(value)) return null;
  const education: CvEducation = {
    degree: text(value.degree),
    institution: text(value.institution),
    period: text(value.period),
    detail: text(value.detail),
  };
  return education.degree || education.institution ? education : null;
}

function parseSkillGroup(value: unknown): CvSkillGroup | null {
  if (!isRecord(value)) return null;
  const items = textList(value.items);
  // Nhóm kỹ năng rỗng thì chỉ còn cái nhãn, không đáng một khối riêng.
  return items.length > 0 ? { label: text(value.label), items } : null;
}

export function parseCvContent(content: unknown): CvContent {
  const root = isRecord(content) ? content : {};
  return {
    profileStatement: text(root.profileStatement),
    coreCompetencies: textList(root.coreCompetencies),
    experiences: objectList(root.experiences, parseExperience),
    projects: objectList(root.projects, parseCvProject),
    educations: objectList(root.educations, parseEducation),
    skillGroups: objectList(root.skillGroups, parseSkillGroup),
  };
}

/**
 * Không đọc được gì cả. Trạng thái này khác hẳn "đang chạy": bản ghi đã DONE
 * nhưng nội dung vô dụng, nên phải nói thẳng thay vì hiện một trang trống.
 */
export function isCvContentEmpty(cv: CvContent): boolean {
  return (
    !cv.profileStatement &&
    cv.coreCompetencies.length === 0 &&
    cv.experiences.length === 0 &&
    cv.projects.length === 0 &&
    cv.educations.length === 0 &&
    cv.skillGroups.length === 0
  );
}

/* =========================================================
   Thư xin việc
   ========================================================= */

export interface CoverLetterContent {
  salutation: string | null;
  opening: string | null;
  bodyParagraphs: string[];
  motivation: string | null;
  closing: string | null;
}

export function parseCoverLetterContent(content: unknown): CoverLetterContent {
  const root = isRecord(content) ? content : {};
  return {
    salutation: text(root.salutation),
    opening: text(root.opening),
    bodyParagraphs: textList(root.bodyParagraphs),
    motivation: text(root.motivation),
    closing: text(root.closing),
  };
}

export function isCoverLetterEmpty(letter: CoverLetterContent): boolean {
  return (
    !letter.salutation &&
    !letter.opening &&
    letter.bodyParagraphs.length === 0 &&
    !letter.motivation &&
    !letter.closing
  );
}

/**
 * Ghép lại thành văn bản thuần để người dùng dán sang email.
 *
 * Thứ tự các đoạn khớp với thứ tự hiển thị trên màn hình — người dùng sao chép
 * xong mà thấy bố cục khác trên trang thì sẽ không tin bản đã sao chép.
 */
export function coverLetterPlainText(letter: CoverLetterContent): string {
  return [
    letter.salutation,
    letter.opening,
    ...letter.bodyParagraphs,
    letter.motivation,
    letter.closing,
  ]
    .filter((part): part is string => part !== null)
    .join("\n\n");
}

/* =========================================================
   Mail ứng tuyển
   ========================================================= */

/** Chữ ký do BACKEND ghép từ hồ sơ, không phải do model viết. */
export interface ApplicationEmailSignature {
  name: string | null;
  email: string | null;
  phone: string | null;
  title: string | null;
}

export interface ApplicationEmailContent {
  subject: string | null;
  greeting: string | null;
  paragraphs: string[];
  attachmentNote: string | null;
  closing: string | null;
  signOff: string | null;
  signature: ApplicationEmailSignature;
  company: string | null;
  position: string | null;
}

export function parseApplicationEmailContent(
  content: unknown,
): ApplicationEmailContent {
  const root = isRecord(content) ? content : {};
  const signature = isRecord(root.signature) ? root.signature : {};
  return {
    subject: text(root.subject),
    greeting: text(root.greeting),
    paragraphs: textList(root.paragraphs),
    attachmentNote: text(root.attachmentNote),
    closing: text(root.closing),
    signOff: text(root.signOff),
    signature: {
      name: text(signature.name),
      email: text(signature.email),
      phone: text(signature.phone),
      title: text(signature.title),
    },
    company: text(root.company),
    position: text(root.position),
  };
}

export function isApplicationEmailEmpty(
  email: ApplicationEmailContent,
): boolean {
  return !email.subject && email.paragraphs.length === 0 && !email.greeting;
}

/**
 * Thân mail dạng văn bản thuần, để dán thẳng vào hộp soạn thư.
 *
 * KHÔNG kèm tiêu đề: tiêu đề đi vào một ô khác của trình gửi mail, và người
 * dùng dán nhầm nó vào thân mail thì phải xoá tay. Vì vậy màn hình có hai nút
 * sao chép riêng.
 */
export function applicationEmailPlainText(
  email: ApplicationEmailContent,
): string {
  const { name, title, phone, email: address } = email.signature;
  const signature = [name, title, phone, address].filter(
    (part): part is string => part !== null,
  );

  return [
    email.greeting,
    ...email.paragraphs,
    email.attachmentNote,
    email.closing,
    email.signOff,
    signature.length > 0 ? signature.join("\n") : null,
  ]
    .filter((part): part is string => part !== null)
    .join("\n\n");
}
