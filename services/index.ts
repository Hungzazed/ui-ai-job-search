export { authService } from "./auth";
export { dashboardService } from "./dashboard";
export { applicationsService } from "./applications";
export { jobsService } from "./jobs";
export { matchesService } from "./matches";
export { agentService } from "./agent";
export { documentsService } from "./documents";
export { interviewService } from "./interview";
export { upskillService } from "./upskill";
export { profileService } from "./profile";
export { profileDraftService } from "./profile-draft";
export { scraperService } from "./scraper";
export { skillsService } from "./skills";
export { adminService } from "./admin";
export { companiesService } from "./companies";

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
  CreateJobInput,
  JobRecord,
  JobMatchDetail,
  JobListItem,
  JobListParams,
  JobSort,
  JobFilters,
  OccupationOption,
  FilterOption,
  RequirementCheck,
  SystemMatch,
} from "./jobs";
export type {
  AgentArtifact,
  AgentRunInput,
  AgentRunRecord,
  AgentRunStatus,
  AgentRunSummary,
  AgentStep,
} from "./agent";
export type {
  ApplicationEmailInput,
  CvContentInput,
  CvLayout,
  CvSectionKey,
  CvTemplate,
  DocumentKind,
  DocumentRecord,
} from "./documents";
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
export type {
  BriefConfidence,
  BriefQueued,
  BriefSource,
  CompanyBriefRecord,
  CompanyBriefView,
  CompanyVerdict,
} from "./companies";
export type { ScrapeRunRecord } from "./scraper";
export type { SkillRecord } from "./skills";
export type { AiFailureKind, AiFailureRecord, AiHealth, PurposeStats } from "./admin";
