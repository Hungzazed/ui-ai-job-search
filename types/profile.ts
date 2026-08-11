/* =========================================================
   Hồ sơ ứng viên — các khối hiển thị trên màn hình Hồ sơ
   ========================================================= */

export type ConnectionStatus = "connected" | "not_connected";

export type ConnectionSourceType = "cv" | "github" | "linkedin" | "manual";

export interface ConnectionSource {
  id: string;
  type: ConnectionSourceType;
  label: string;
  status: ConnectionStatus;
  detail: string;
}

export type SkillLevel = "beginner" | "intermediate" | "advanced" | "expert";

export interface Skill {
  name: string;
  level: SkillLevel;
}

export interface ExperienceItem {
  id: string;
  company: string;
  position: string;
  period: string;
  location: string;
  highlights: string[];
}

export interface ProjectItem {
  id: string;
  name: string;
  description: string;
  technologies: string[];
  period: string;
}

export interface EducationItem {
  id: string;
  school: string;
  degree: string;
  field: string;
  period: string;
  gpa?: string;
}

export interface CertificateItem {
  id: string;
  name: string;
  issuer: string;
  year: string;
}

export interface ActivityItem {
  id: string;
  title: string;
  description: string;
  date: string;
}

/**
 * Hồ sơ dạng GIAO DIỆN dùng để hiển thị.
 *
 * Khác với `ProfileRecord` ở `lib/services/profile.ts`, vốn là hình dạng thật
 * backend trả về. Hai thứ chưa khớp nhau: `projects` và `certificates` ở đây
 * chưa có gì đứng sau ở backend, còn backend thì có `citizenship`,
 * `workPermit`, `dealBreakers`... mà màn hình chưa dùng. Khi nối màn hình Hồ
 * sơ vào dữ liệu thật thì phải chốt lại một trong hai.
 */
export interface UserProfile {
  id: string;
  name: string;
  title: string;
  email: string;
  location: string;
  phone: string;
  initials: string;
  summary: string;
  profileCompletion: number;
  skills: Skill[];
  experiences: ExperienceItem[];
  projects: ProjectItem[];
  educations: EducationItem[];
  certificates: CertificateItem[];
  activities: ActivityItem[];
  connections: ConnectionSource[];
}
