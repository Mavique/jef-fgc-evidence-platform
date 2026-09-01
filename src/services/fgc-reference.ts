import {
  campusProgrammeOfferings,
  campusSites,
  programmeCatalogue,
  programmeCategories,
  programmeLevels,
  provinces,
  referenceDataQualitySnapshot,
  subjectRegistry,
  tvetColleges,
  type CampusReference,
  type CollegeReference,
  type ProgrammeLevelReference,
  type ProgrammeReference,
  type ProvinceReference,
  type SubjectReference,
  type CurriculumSearchResult
} from "@/content/fgc-reference-data";

export type LecturerReferenceSelection = {
  provinceId?: string;
  collegeId?: string;
  campusId?: string;
  programmeCategoryId?: string;
  programmeId?: string;
  levelId?: string;
};

export type ReferenceDataQualitySnapshot = typeof referenceDataQualitySnapshot;

const delay = () => new Promise((resolve) => setTimeout(resolve, 1));

function textMatch(value: string, query: string) {
  const canonicalValue = value.toLowerCase().replace(/[^a-z0-9]+/g, "");
  const canonicalQuery = query.toLowerCase().replace(/[^a-z0-9]+/g, "");
  return canonicalValue.includes(canonicalQuery);
}

export const fgcReferenceService = {
  async listProvinces(): Promise<ProvinceReference[]> {
    await delay();
    return provinces;
  },

  async listColleges(provinceId?: string): Promise<CollegeReference[]> {
    await delay();
    return provinceId ? tvetColleges.filter((college) => college.provinceId === provinceId) : tvetColleges;
  },

  async listCampuses(collegeId?: string): Promise<CampusReference[]> {
    await delay();
    return collegeId ? campusSites.filter((campus) => campus.collegeId === collegeId) : campusSites;
  },

  async listProgrammeCategories() {
    await delay();
    return programmeCategories;
  },

  async listProgrammes(selection: LecturerReferenceSelection = {}): Promise<ProgrammeReference[]> {
    await delay();
    const verifiedCampusOfferings = selection.campusId
      ? campusProgrammeOfferings.filter((offering) => offering.campusId === selection.campusId && offering.status === "VERIFIED")
      : [];
    const offeredProgrammeIds = verifiedCampusOfferings.length > 0
      ? new Set(verifiedCampusOfferings.map((offering) => offering.programmeId))
      : null;

    return programmeCatalogue.filter((programme) => {
      const categoryMatch = selection.programmeCategoryId ? programme.categoryId === selection.programmeCategoryId : true;
      const offeringMatch = offeredProgrammeIds ? offeredProgrammeIds.has(programme.id) : true;
      return categoryMatch && offeringMatch;
    });
  },

  async listLevels(programmeId?: string): Promise<ProgrammeLevelReference[]> {
    await delay();
    const programme = programmeCatalogue.find((item) => item.id === programmeId);
    if (!programme) return programmeLevels;
    return programmeLevels.filter((level) => level.categoryId === programme.categoryId);
  },

  async listSubjects(programmeId?: string, levelId?: string): Promise<SubjectReference[]> {
    await delay();
    return subjectRegistry.filter((subject) => {
      const programmeMatch = programmeId ? subject.programmeId === programmeId : true;
      const levelMatch = levelId ? subject.levelId === levelId : true;
      return programmeMatch && levelMatch;
    });
  },

  async searchSubjects(query: string): Promise<SubjectReference[]> {
    await delay();
    if (!query.trim()) return subjectRegistry;
    return subjectRegistry.filter((subject) => textMatch(subject.name, query) || textMatch(subject.code, query));
  },

  async searchProgrammes(query: string): Promise<ProgrammeReference[]> {
    await delay();
    if (!query.trim()) return programmeCatalogue;
    return programmeCatalogue.filter((programme) => (
      textMatch(programme.title, query) ||
      textMatch(programme.shortTitle, query) ||
      textMatch(programme.framework, query) ||
      programme.aliases?.some((alias) => textMatch(alias, query))
    ));
  },

  async searchCurriculum(query: string): Promise<CurriculumSearchResult[]> {
    await delay();
    if (!query.trim()) return [];

    const programmeResults: CurriculumSearchResult[] = programmeCatalogue
      .filter((programme) => (
        textMatch(programme.title, query) ||
        textMatch(programme.shortTitle, query) ||
        textMatch(programme.framework, query) ||
        programme.aliases?.some((alias) => textMatch(alias, query))
      ))
      .map((programme) => ({
        id: programme.id,
        type: "PROGRAMME",
        title: programme.title,
        subtitle: `${programme.framework.replaceAll("_", " ")} · ${programme.discipline}`,
        framework: programme.framework
      }));

    const subjectResults: CurriculumSearchResult[] = subjectRegistry
      .filter((subject) => textMatch(subject.name, query) || textMatch(subject.code, query) || textMatch(subject.family, query))
      .map((subject) => ({
        id: subject.id,
        type: "SUBJECT",
        title: subject.name,
        subtitle: `${subject.code} · ${subject.requirement}`,
        framework: subject.framework
      }));

    return [...programmeResults, ...subjectResults];
  },

  async getQualitySnapshot(): Promise<ReferenceDataQualitySnapshot> {
    await delay();
    return referenceDataQualitySnapshot;
  }
};
