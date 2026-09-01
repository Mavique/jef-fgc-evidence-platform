import {
  correctiveActions,
  demoUserProfiles,
  decisionRegister,
  evidenceItems,
  fgcRouteDefinitions,
  learnerUseRecords,
  lecturerAssessments,
  rolePermissions,
  type CorrectiveAction,
  type DemoUserProfile,
  type DecisionItem,
  type EvidenceItem,
  type FgcRouteDefinition,
  type LearnerUseRecord,
  type LecturerAssessment,
  type RoleAssignment,
  type UserRole
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

export interface AuthService {
  getDemoScope(role?: UserRole): Promise<FgcScope>;
  listDemoProfiles(): Promise<DemoUserProfile[]>;
  getDemoProfile(userId?: string): Promise<DemoUserProfile>;
  listRoleAssignments(userId?: string): Promise<RoleAssignment[]>;
}

export interface EvidenceService {
  listEvidence(scope: FgcScope): Promise<EvidenceItem[]>;
}

export interface AnalyticsIngestionService {
  listLearnerUse(scope: FgcScope): Promise<LearnerUseRecord[]>;
}

export interface AssessmentService {
  listAssessments(scope: FgcScope): Promise<LecturerAssessment[]>;
}

export interface ActionService {
  listActions(scope: FgcScope): Promise<CorrectiveAction[]>;
}

export interface ReportService {
  listDecisionRegister(): Promise<DecisionItem[]>;
}

export interface PermissionService {
  explain(role: UserRole): Promise<string[]>;
  listRouteDefinitions(): Promise<FgcRouteDefinition[]>;
}

export interface FgcServiceBundle {
  auth: AuthService;
  evidence: EvidenceService;
  analytics: AnalyticsIngestionService;
  assessments: AssessmentService;
  actions: ActionService;
  reports: ReportService;
  permissions: PermissionService;
  getSnapshot(role?: UserRole): Promise<ObservatorySnapshot>;
}

const delay = () => new Promise((resolve) => setTimeout(resolve, 1));

export const mockFgcServices: FgcServiceBundle = {
  auth: {
    async getDemoScope(role = "JEF Administrator") {
      await delay();
      return {
        reportingPeriod: "September 2026 FGC evidence-validation workshop",
        collegeScope: "Demonstration national scope, 4 synthetic colleges",
        role
      };
    },
    async listDemoProfiles() {
      await delay();
      return demoUserProfiles;
    },
    async getDemoProfile(userId = "USR-MERSETA-001") {
      await delay();
      return demoUserProfiles.find((profile) => profile.id === userId) ?? demoUserProfiles[0];
    },
    async listRoleAssignments(userId) {
      await delay();
      const profiles = userId ? demoUserProfiles.filter((profile) => profile.id === userId) : demoUserProfiles;
      return profiles.flatMap((profile) => profile.roleAssignments);
    }
  },
  evidence: {
    async listEvidence() {
      await delay();
      return evidenceItems;
    }
  },
  analytics: {
    async listLearnerUse() {
      await delay();
      return learnerUseRecords;
    }
  },
  assessments: {
    async listAssessments() {
      await delay();
      return lecturerAssessments;
    }
  },
  actions: {
    async listActions() {
      await delay();
      return correctiveActions;
    }
  },
  reports: {
    async listDecisionRegister() {
      await delay();
      return decisionRegister;
    }
  },
  permissions: {
    async explain(role) {
      await delay();
      return rolePermissions[role];
    },
    async listRouteDefinitions() {
      await delay();
      return fgcRouteDefinitions;
    }
  },
  async getSnapshot(role) {
    const scope = await this.auth.getDemoScope(role);
    const [evidence, learnerUse, assessments, actions, decisions, permissions] = await Promise.all([
      this.evidence.listEvidence(scope),
      this.analytics.listLearnerUse(scope),
      this.assessments.listAssessments(scope),
      this.actions.listActions(scope),
      this.reports.listDecisionRegister(),
      this.permissions.explain(scope.role)
    ]);

    return { scope, evidence, learnerUse, assessments, actions, decisions, permissions };
  }
};
