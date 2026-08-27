export interface PartialProposal {
  headline?: string;
  summary?: string;
  primarySkills?: string[];
  secondarySkills?: string[];
  experiences?: Array<{ position?: string; company?: string }>;
  educations?: Array<{ degree?: string; institution?: string }>;
}
