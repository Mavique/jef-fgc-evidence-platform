import { describe, expect, it } from "vitest";
import {
  campusProgrammeOfferings,
  campusSites,
  programmeCatalogue,
  programmeCategories,
  provinces,
  subjectRegistry,
  tvetColleges
} from "@/content/fgc-reference-data";
import { fgcReferenceService } from "@/services/fgc-reference";

describe("FGC national TVET reference data", () => {
  it("loads the South African province and public TVET college backbone", () => {
    expect(provinces).toHaveLength(9);
    expect(tvetColleges).toHaveLength(50);
    expect(new Set(tvetColleges.map((college) => college.id)).size).toBe(50);

    expect(tvetColleges.find((college) => college.officialName === "Sedibeng TVET College")?.provinceId).toBe("province-gp");
    expect(tvetColleges.find((college) => college.officialName === "Boland TVET College")?.provinceId).toBe("province-wc");
  });

  it("keeps campuses and campus programme offerings conservative until verified imports exist", () => {
    expect(campusSites.filter((campus) => campus.collegeId === "sedibeng-tvet-college").map((campus) => campus.officialName)).toEqual([
      "Heidelberg Campus",
      "Sebokeng Campus",
      "Vanderbijlpark Campus",
      "Vereeniging Campus"
    ]);
    expect(campusProgrammeOfferings).toHaveLength(0);
  });

  it("exposes programme and subject reference data for staged capture", () => {
    expect(programmeCategories.map((category) => category.code)).toEqual(expect.arrayContaining([
      "NCV",
      "REPORT_191_NATED_ENGINEERING",
      "REPORT_191_NATED_BUSINESS",
      "OCCUPATIONAL_SKILLS_PROGRAMME",
      "APPRENTICESHIP_TRADE",
      "HISTORICAL_TEACH_OUT"
    ]));
    expect(programmeCatalogue.filter((programme) => programme.categoryId === "category-ncv").length).toBeGreaterThanOrEqual(18);
    expect(subjectRegistry.some((subject) => subject.programmeId === "programme-engineering-and-related-design" && subject.levelId === "level-ncv-l2")).toBe(true);
    expect(subjectRegistry.some((subject) => subject.programmeId === "programme-electrical-engineering" && subject.levelId === "level-n4")).toBe(true);
  });
});

describe("FGC reference service", () => {
  it("filters colleges and campuses by the selected parent record", async () => {
    const gautengColleges = await fgcReferenceService.listColleges("province-gp");
    expect(gautengColleges.map((college) => college.officialName)).toContain("Sedibeng TVET College");
    expect(gautengColleges.map((college) => college.officialName)).not.toContain("Boland TVET College");

    const sedibengCampuses = await fgcReferenceService.listCampuses("sedibeng-tvet-college");
    expect(sedibengCampuses).toHaveLength(4);
  });

  it("falls back to the national catalogue when campus offerings have not been verified", async () => {
    const programmes = await fgcReferenceService.listProgrammes({
      campusId: "sedibeng-sebokeng-campus",
      programmeCategoryId: "category-ncv"
    });

    expect(programmes.map((programme) => programme.id)).toContain("programme-engineering-and-related-design");
  });

  it("filters subjects by programme and level", async () => {
    const subjects = await fgcReferenceService.listSubjects("programme-engineering-and-related-design", "level-ncv-l2");

    expect(subjects.every((subject) => subject.programmeId === "programme-engineering-and-related-design")).toBe(true);
    expect(subjects.every((subject) => subject.levelId === "level-ncv-l2")).toBe(true);
  });

  it("searches the national curriculum catalogue without campus restrictions", async () => {
    const erdResults = await fgcReferenceService.searchCurriculum("ERD");
    expect(erdResults.some((result) => result.type === "PROGRAMME" && result.title === "Engineering and Related Design")).toBe(true);

    const electricalResults = await fgcReferenceService.searchCurriculum("Electrotechnics N4");
    expect(electricalResults.some((result) => result.type === "SUBJECT" && result.title === "Electrotechnics N4")).toBe(true);
  });
});
