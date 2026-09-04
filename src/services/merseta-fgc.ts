import type {
  CorrectiveAction,
  DecisionItem,
  EvidenceItem,
  LearnerUseRecord,
  LecturerAssessment,
  UserRole
} from "@/content/merseta-fgc";

export type FgcScope = {
  reportingPeriod: string;
  collegeScope: string;
  role: UserRole;
};

export type ObservatorySnapshot = {
  scope: FgcScope;
  evidence: EvidenceItem[];
  learnerUse: LearnerUseRecord[];
  assessments: LecturerAssessment[];
  actions: CorrectiveAction[];
  decisions: DecisionItem[];
  permissions: string[];
};
