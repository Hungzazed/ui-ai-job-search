export { authService } from "./auth";
export { dashboardService } from "./dashboard";
export { applicationsService } from "./applications";
export { applyAttemptsService } from "./apply-attempts";
export { jobsService } from "./jobs";
export { matchesService } from "./matches";
export { documentsService } from "./documents";
export { interviewService } from "./interview";
export { upskillService } from "./upskill";
export { profileService } from "./profile";
export { profileDraftService } from "./profile-draft";
export { scraperService } from "./scraper";
export { skillsService } from "./skills";
export { adminService } from "./admin";

export type {
  AuthResult,
  Paginated,
  QueuedDocument,
  QueuedReport,
  QueuedResult,
  QueuedScrapeRun,
  WorkStatus,
} from "./types";

export type {
  ApplyAttemptRecord,
  ApplyOutcome,
  FilledField,
} from "./apply-attempts";
export type { CreateJobInput, JobRecord } from "./jobs";
export type { DocumentKind, DocumentRecord } from "./documents";
export type { InterviewPrepRecord } from "./interview";
export type { UpskillReportRecord } from "./upskill";
export type { ProfileRecord } from "./profile";
export type {
  CvUploadReceipt,
  EvidenceRecord,
  ProfileDraftRecord,
  ProfileDraftSummary,
  ProfileProposal,
  ProposedCertificate,
  ProposedEducation,
  ProposedExperience,
  ProposedProject,
} from "./profile-draft";
export type { ScrapeRunRecord } from "./scraper";
export type { SkillRecord } from "./skills";
export type { AiFailureKind, AiFailureRecord, AiHealth, PurposeStats } from "./admin";
