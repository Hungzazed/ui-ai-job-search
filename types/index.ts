/* =========================================================
   AI Career Agent — Data Models
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

export type SalaryCurrency = "VND" | "USD";
export type SalaryPeriod = "month" | "year";

export interface SalaryRange {
  min: number;
  max: number;
  currency: SalaryCurrency;
  period: SalaryPeriod;
}

export interface Job {
  id: string;
  company: string;
  companyInitials: string;
  companyColor: string;
  title: string;
  location: string;
  salary: SalaryRange;
  tags: string[];
  postedAt: string;
  aiMatch: number;
  saved: boolean;
}

export interface AiMatchDetail {
  overall: number;
  criteria: {
    skills: number;
    experience: number;
    projects: number;
    level: number;
    salaryLocation: number;
  };
  strengths: string[];
  improvements: string[];
  jdSummary: {
    about: string;
    responsibilities: string[];
    requirements: string[];
  };
}

export type ApplicationStatus =
  | "submitted"
  | "reviewing"
  | "interview"
  | "rejected"
  | "offered";

export interface Application {
  id: string;
  jobTitle: string;
  company: string;
  companyInitials: string;
  companyColor: string;
  appliedAt: string;
  status: ApplicationStatus;
  matchScore: number;
  note?: string;
}

export type AiSuggestionType = "cv" | "apply" | "network" | "skill";

export interface AiSuggestion {
  id: string;
  type: AiSuggestionType;
  title: string;
  description: string;
}

export interface StatSummary {
  profileCompletion: number;
  matchingJobsCount: number;
  applicationsCount: number;
  avgMatchRate: number;
  weeklyApplications: number;
}

export interface KpiMetric {
  label: string;
  value: string;
  change: string;
  trend: "up" | "down";
}

export interface ActivityPoint {
  date: string;
  users: number;
  applications: number;
  aiRequests: number;
}

export interface JobSourceSlice {
  name: string;
  value: number;
  color: string;
}
