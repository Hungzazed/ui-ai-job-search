export interface PartialCv {
  profileStatement?: string;
  coreCompetencies?: string[];
  experiences?: Array<{ position?: string; company?: string; bullets?: string[] }>;
  projects?: Array<{ name?: string; bullets?: string[] }>;
  educations?: Array<{ degree?: string; institution?: string }>;
  skillGroups?: Array<{ label?: string; items?: string[] }>;
}
