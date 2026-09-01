export type VerificationStatus =
  | "OFFICIAL_VERIFIED"
  | "COLLEGE_VERIFIED"
  | "SECONDARY_VERIFIED"
  | "PENDING_VERIFICATION"
  | "HISTORICAL"
  | "UNKNOWN";

export type OfferingStatus = "VERIFIED" | "REPORTED" | "PENDING_VERIFICATION" | "HISTORICAL" | "TEACH_OUT" | "INACTIVE";

export type ProvinceReference = {
  id: string;
  name: string;
  code: string;
};

export type CollegeReference = {
  id: string;
  provinceId: string;
  officialName: string;
  shortName: string;
  acronym?: string;
  verificationStatus: VerificationStatus;
};

export type CampusReference = {
  id: string;
  collegeId: string;
  officialName: string;
  siteType: "CAMPUS" | "SATELLITE_CAMPUS" | "SKILLS_CENTRE" | "HEAD_OFFICE" | "OTHER_DELIVERY_SITE";
  teachingSite: boolean;
  verificationStatus: VerificationStatus;
};

export type ProgrammeCategoryReference = {
  id: string;
  code: string;
  name: string;
};

export type CurriculumFramework =
  | "NCV"
  | "REPORT_191_NATED_ENGINEERING"
  | "REPORT_191_NATED_BUSINESS"
  | "REPORT_191_NATED_SERVICES"
  | "OCCUPATIONAL_QUALIFICATION"
  | "OCCUPATIONAL_PART_QUALIFICATION"
  | "OCCUPATIONAL_SKILLS_PROGRAMME"
  | "LEARNERSHIP_LINKED"
  | "APPRENTICESHIP_TRADE"
  | "PLP"
  | "LEVEL_5"
  | "LEVEL_6"
  | "OTHER_APPROVED_TVET"
  | "HISTORICAL_TEACH_OUT";

export type ProgrammeReference = {
  id: string;
  categoryId: string;
  title: string;
  shortTitle: string;
  framework: CurriculumFramework;
  discipline: string;
  aliases?: string[];
  verificationStatus: VerificationStatus;
};

export type ProgrammeLevelReference = {
  id: string;
  categoryId: string;
  code: string;
  label: string;
};

export type SubjectReference = {
  id: string;
  programmeId: string;
  levelId: string;
  name: string;
  code: string;
  requirement: "FUNDAMENTAL" | "VOCATIONAL" | "CORE" | "COMPULSORY" | "ELECTIVE" | "SPECIALISATION";
  framework: CurriculumFramework;
  family: string;
  verificationStatus: VerificationStatus;
};

export type CurriculumSearchResult = {
  id: string;
  type: "PROGRAMME" | "SUBJECT";
  title: string;
  subtitle: string;
  framework: CurriculumFramework;
};

export type CampusProgrammeOfferingReference = {
  campusId: string;
  programmeId: string;
  levelId: string;
  status: OfferingStatus;
  verificationStatus: VerificationStatus;
};

export const provinces: ProvinceReference[] = [
  { id: "province-ec", name: "Eastern Cape", code: "EC" },
  { id: "province-fs", name: "Free State", code: "FS" },
  { id: "province-gp", name: "Gauteng", code: "GP" },
  { id: "province-kzn", name: "KwaZulu-Natal", code: "KZN" },
  { id: "province-lp", name: "Limpopo", code: "LP" },
  { id: "province-mp", name: "Mpumalanga", code: "MP" },
  { id: "province-nc", name: "Northern Cape", code: "NC" },
  { id: "province-nw", name: "North West", code: "NW" },
  { id: "province-wc", name: "Western Cape", code: "WC" }
];

const college = (provinceId: string, officialName: string, shortName: string, acronym?: string): CollegeReference => ({
  id: officialName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""),
  provinceId,
  officialName,
  shortName,
  acronym,
  verificationStatus: "OFFICIAL_VERIFIED"
});

export const tvetColleges: CollegeReference[] = [
  college("province-ec", "Buffalo City TVET College", "Buffalo City", "BCC"),
  college("province-ec", "Eastcape Midlands TVET College", "Eastcape Midlands", "EMC"),
  college("province-ec", "Ikhala TVET College", "Ikhala"),
  college("province-ec", "Ingwe TVET College", "Ingwe"),
  college("province-ec", "King Hintsa TVET College", "King Hintsa"),
  college("province-ec", "King Sabata Dalindyebo TVET College", "King Sabata Dalindyebo", "KSD"),
  college("province-ec", "Lovedale TVET College", "Lovedale"),
  college("province-ec", "Port Elizabeth TVET College", "Port Elizabeth", "PE TVET"),
  college("province-fs", "Flavius Mareka TVET College", "Flavius Mareka"),
  college("province-fs", "Goldfields TVET College", "Goldfields"),
  college("province-fs", "Maluti TVET College", "Maluti"),
  college("province-fs", "Motheo TVET College", "Motheo"),
  college("province-gp", "Central Johannesburg TVET College", "Central Johannesburg", "CJC"),
  college("province-gp", "Ekurhuleni East TVET College", "Ekurhuleni East", "EEC"),
  college("province-gp", "Ekurhuleni West TVET College", "Ekurhuleni West", "EWC"),
  college("province-gp", "Sedibeng TVET College", "Sedibeng"),
  college("province-gp", "South West Gauteng TVET College", "South West Gauteng", "SWGC"),
  college("province-gp", "Tshwane North TVET College", "Tshwane North", "TNC"),
  college("province-gp", "Tshwane South TVET College", "Tshwane South", "TSC"),
  college("province-gp", "Western TVET College", "Western", "Westcol"),
  college("province-kzn", "Coastal KZN TVET College", "Coastal KZN"),
  college("province-kzn", "Elangeni TVET College", "Elangeni"),
  college("province-kzn", "Esayidi TVET College", "Esayidi"),
  college("province-kzn", "Majuba TVET College", "Majuba"),
  college("province-kzn", "Mnambithi TVET College", "Mnambithi"),
  college("province-kzn", "Mthashana TVET College", "Mthashana"),
  college("province-kzn", "Thekwini TVET College", "Thekwini"),
  college("province-kzn", "Umfolozi TVET College", "Umfolozi"),
  college("province-kzn", "Umgungundlovu TVET College", "Umgungundlovu"),
  college("province-lp", "Capricorn TVET College", "Capricorn"),
  college("province-lp", "Lephalale TVET College", "Lephalale"),
  college("province-lp", "Letaba TVET College", "Letaba"),
  college("province-lp", "Mopani South East TVET College", "Mopani South East"),
  college("province-lp", "Sekhukhune TVET College", "Sekhukhune"),
  college("province-lp", "Vhembe TVET College", "Vhembe"),
  college("province-lp", "Waterberg TVET College", "Waterberg"),
  college("province-mp", "Ehlanzeni TVET College", "Ehlanzeni"),
  college("province-mp", "Gert Sibande TVET College", "Gert Sibande"),
  college("province-mp", "Nkangala TVET College", "Nkangala"),
  college("province-nc", "Northern Cape Rural TVET College", "Northern Cape Rural", "NCR TVET"),
  college("province-nc", "Northern Cape Urban TVET College", "Northern Cape Urban", "NCU TVET"),
  college("province-nw", "Orbit TVET College", "Orbit"),
  college("province-nw", "Taletso TVET College", "Taletso"),
  college("province-nw", "Vuselela TVET College", "Vuselela"),
  college("province-wc", "Boland TVET College", "Boland"),
  college("province-wc", "College of Cape Town for TVET", "College of Cape Town", "CCT"),
  college("province-wc", "False Bay TVET College", "False Bay"),
  college("province-wc", "Northlink TVET College", "Northlink"),
  college("province-wc", "South Cape TVET College", "South Cape"),
  college("province-wc", "West Coast TVET College", "West Coast")
];

export const campusSites: CampusReference[] = [
  { id: "sedibeng-heidelberg-campus", collegeId: "sedibeng-tvet-college", officialName: "Heidelberg Campus", siteType: "CAMPUS", teachingSite: true, verificationStatus: "COLLEGE_VERIFIED" },
  { id: "sedibeng-sebokeng-campus", collegeId: "sedibeng-tvet-college", officialName: "Sebokeng Campus", siteType: "CAMPUS", teachingSite: true, verificationStatus: "COLLEGE_VERIFIED" },
  { id: "sedibeng-vanderbijlpark-campus", collegeId: "sedibeng-tvet-college", officialName: "Vanderbijlpark Campus", siteType: "CAMPUS", teachingSite: true, verificationStatus: "COLLEGE_VERIFIED" },
  { id: "sedibeng-vereeniging-campus", collegeId: "sedibeng-tvet-college", officialName: "Vereeniging Campus", siteType: "CAMPUS", teachingSite: true, verificationStatus: "COLLEGE_VERIFIED" },
  { id: "buffalo-city-east-london-campus", collegeId: "buffalo-city-tvet-college", officialName: "East London Campus", siteType: "CAMPUS", teachingSite: true, verificationStatus: "OFFICIAL_VERIFIED" },
  { id: "buffalo-city-john-knox-bokwe-campus", collegeId: "buffalo-city-tvet-college", officialName: "John Knox Bokwe Campus", siteType: "CAMPUS", teachingSite: true, verificationStatus: "OFFICIAL_VERIFIED" },
  { id: "buffalo-city-st-marks-campus", collegeId: "buffalo-city-tvet-college", officialName: "St Marks Campus", siteType: "CAMPUS", teachingSite: true, verificationStatus: "OFFICIAL_VERIFIED" }
];

export const programmeCategories: ProgrammeCategoryReference[] = [
  { id: "category-ncv", code: "NCV", name: "National Certificate (Vocational)" },
  { id: "category-report-191-engineering", code: "REPORT_191_NATED_ENGINEERING", name: "Report 191 / NATED Engineering Studies" },
  { id: "category-report-191-business", code: "REPORT_191_NATED_BUSINESS", name: "Report 191 / NATED Business Studies" },
  { id: "category-report-191-services", code: "REPORT_191_NATED_SERVICES", name: "Report 191 / NATED Services and General Studies" },
  { id: "category-occupational", code: "OCCUPATIONAL", name: "Occupational Qualifications" },
  { id: "category-occupational-part", code: "OCCUPATIONAL_PART_QUALIFICATION", name: "Occupational Part-Qualifications" },
  { id: "category-occupational-skills", code: "OCCUPATIONAL_SKILLS_PROGRAMME", name: "Occupational Skills Programmes" },
  { id: "category-learnership", code: "LEARNERSHIP_LINKED", name: "Learnership-linked Programmes" },
  { id: "category-trades", code: "APPRENTICESHIP_TRADE", name: "Apprenticeships / Trades" },
  { id: "category-plp", code: "PLP", name: "Pre-Vocational Learning Programme" },
  { id: "category-level-5", code: "LEVEL_5", name: "Level 5 Qualifications" },
  { id: "category-level-6", code: "LEVEL_6", name: "Level 6 Qualifications" },
  { id: "category-other-approved", code: "OTHER_APPROVED_TVET", name: "Other Approved TVET Programmes" },
  { id: "category-teach-out", code: "HISTORICAL_TEACH_OUT", name: "Historical / Teach-Out Programmes" }
];

const ncvProgrammes = [
  "Civil Engineering and Building Construction",
  "Drawing Office Practice",
  "Education and Development",
  "Electrical Infrastructure Construction",
  "Engineering and Related Design",
  "Finance, Economics and Accounting",
  "Hospitality",
  "Information Technology and Computer Science",
  "Management",
  "Marketing",
  "Mechatronics",
  "Office Administration",
  "Primary Agriculture",
  "Process Instrumentation",
  "Process Plant Operations",
  "Safety in Society",
  "Tourism",
  "Transport and Logistics"
];

export const programmeCatalogue: ProgrammeReference[] = [
  ...ncvProgrammes.map((title) => ({
    id: `programme-${title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")}`,
    categoryId: "category-ncv",
    title,
    shortTitle: title,
    framework: "NCV" as const,
    discipline: title.includes("Engineering") || title.includes("Electrical") || title.includes("Mechatronics") ? "Engineering" : title,
    aliases: title === "Engineering and Related Design" ? ["ERD"] : title === "Electrical Infrastructure Construction" ? ["EIC"] : [],
    verificationStatus: "PENDING_VERIFICATION" as const
  })),
  { id: "programme-electrical-engineering", categoryId: "category-report-191-engineering", title: "Electrical Engineering", shortTitle: "Electrical Engineering", framework: "REPORT_191_NATED_ENGINEERING", discipline: "Engineering", aliases: ["NATED Electrical", "N Courses Electrical"], verificationStatus: "PENDING_VERIFICATION" },
  { id: "programme-mechanical-engineering", categoryId: "category-report-191-engineering", title: "Mechanical Engineering", shortTitle: "Mechanical Engineering", framework: "REPORT_191_NATED_ENGINEERING", discipline: "Engineering", verificationStatus: "PENDING_VERIFICATION" },
  { id: "programme-civil-engineering-nated", categoryId: "category-report-191-engineering", title: "Civil Engineering", shortTitle: "Civil Engineering", framework: "REPORT_191_NATED_ENGINEERING", discipline: "Construction", verificationStatus: "PENDING_VERIFICATION" },
  { id: "programme-business-management", categoryId: "category-report-191-business", title: "Business Management", shortTitle: "Business Management", framework: "REPORT_191_NATED_BUSINESS", discipline: "Business and Management", aliases: ["Business Studies"], verificationStatus: "PENDING_VERIFICATION" },
  { id: "programme-financial-management", categoryId: "category-report-191-business", title: "Financial Management", shortTitle: "Financial Management", framework: "REPORT_191_NATED_BUSINESS", discipline: "Finance", verificationStatus: "PENDING_VERIFICATION" },
  { id: "programme-plp", categoryId: "category-plp", title: "Pre-Vocational Learning Programme", shortTitle: "PLP", framework: "PLP", discipline: "Education", aliases: ["PLP"], verificationStatus: "PENDING_VERIFICATION" }
];

export const programmeLevels: ProgrammeLevelReference[] = [
  { id: "level-ncv-l2", categoryId: "category-ncv", code: "NCV_L2", label: "NC(V) Level 2" },
  { id: "level-ncv-l3", categoryId: "category-ncv", code: "NCV_L3", label: "NC(V) Level 3" },
  { id: "level-ncv-l4", categoryId: "category-ncv", code: "NCV_L4", label: "NC(V) Level 4" },
  { id: "level-n1", categoryId: "category-report-191-engineering", code: "N1", label: "N1" },
  { id: "level-n2", categoryId: "category-report-191-engineering", code: "N2", label: "N2" },
  { id: "level-n3", categoryId: "category-report-191-engineering", code: "N3", label: "N3" },
  { id: "level-n4", categoryId: "category-report-191-engineering", code: "N4", label: "N4" },
  { id: "level-n5", categoryId: "category-report-191-engineering", code: "N5", label: "N5" },
  { id: "level-n6", categoryId: "category-report-191-engineering", code: "N6", label: "N6" },
  { id: "level-business-n4", categoryId: "category-report-191-business", code: "N4", label: "N4" },
  { id: "level-business-n5", categoryId: "category-report-191-business", code: "N5", label: "N5" },
  { id: "level-business-n6", categoryId: "category-report-191-business", code: "N6", label: "N6" },
  { id: "level-plp", categoryId: "category-plp", code: "PLP", label: "PLP" }
];

export const campusProgrammeOfferings: CampusProgrammeOfferingReference[] = [];

export const subjectRegistry: SubjectReference[] = [
  { id: "subject-ncv-english", programmeId: "programme-engineering-and-related-design", levelId: "level-ncv-l2", name: "English First Additional Language", code: "NCV-FUND-ENG", requirement: "FUNDAMENTAL", framework: "NCV", family: "Fundamentals", verificationStatus: "PENDING_VERIFICATION" },
  { id: "subject-ncv-math", programmeId: "programme-engineering-and-related-design", levelId: "level-ncv-l2", name: "Mathematics", code: "NCV-FUND-MATH", requirement: "FUNDAMENTAL", framework: "NCV", family: "Fundamentals", verificationStatus: "PENDING_VERIFICATION" },
  { id: "subject-ncv-life-orientation", programmeId: "programme-engineering-and-related-design", levelId: "level-ncv-l2", name: "Life Orientation", code: "NCV-FUND-LO", requirement: "FUNDAMENTAL", framework: "NCV", family: "Fundamentals", verificationStatus: "PENDING_VERIFICATION" },
  { id: "subject-ncv-engineering-fundamentals", programmeId: "programme-engineering-and-related-design", levelId: "level-ncv-l2", name: "Engineering Fundamentals", code: "NCV-ERD-FUND-L2", requirement: "VOCATIONAL", framework: "NCV", family: "Mechanical Engineering", verificationStatus: "PENDING_VERIFICATION" },
  { id: "subject-ncv-engineering-technology", programmeId: "programme-engineering-and-related-design", levelId: "level-ncv-l2", name: "Engineering Technology", code: "NCV-ERD-TECH-L2", requirement: "VOCATIONAL", framework: "NCV", family: "Mechanical Engineering", verificationStatus: "PENDING_VERIFICATION" },
  { id: "subject-nated-electrotechnics-n4", programmeId: "programme-electrical-engineering", levelId: "level-n4", name: "Electrotechnics N4", code: "NATED-ELEC-TECH-N4", requirement: "COMPULSORY", framework: "REPORT_191_NATED_ENGINEERING", family: "Electrical Engineering", verificationStatus: "PENDING_VERIFICATION" },
  { id: "subject-nated-engineering-science-n4", programmeId: "programme-electrical-engineering", levelId: "level-n4", name: "Engineering Science N4", code: "NATED-ENG-SCI-N4", requirement: "COMPULSORY", framework: "REPORT_191_NATED_ENGINEERING", family: "Electrical Engineering", verificationStatus: "PENDING_VERIFICATION" },
  { id: "subject-nated-mathematics-n4", programmeId: "programme-electrical-engineering", levelId: "level-n4", name: "Mathematics N4", code: "NATED-MATH-N4", requirement: "COMPULSORY", framework: "REPORT_191_NATED_ENGINEERING", family: "Fundamentals", verificationStatus: "PENDING_VERIFICATION" },
  { id: "subject-nated-industrial-electronics-n4", programmeId: "programme-electrical-engineering", levelId: "level-n4", name: "Industrial Electronics N4", code: "NATED-IND-ELEC-N4", requirement: "COMPULSORY", framework: "REPORT_191_NATED_ENGINEERING", family: "Electrical Engineering", verificationStatus: "PENDING_VERIFICATION" },
  { id: "subject-nated-management-communication-n4", programmeId: "programme-business-management", levelId: "level-business-n4", name: "Management Communication N4", code: "NATED-MAN-COM-N4", requirement: "COMPULSORY", framework: "REPORT_191_NATED_BUSINESS", family: "Business Management", verificationStatus: "PENDING_VERIFICATION" },
  { id: "subject-nated-ebm-n4", programmeId: "programme-business-management", levelId: "level-business-n4", name: "Entrepreneurship and Business Management N4", code: "NATED-EBM-N4", requirement: "COMPULSORY", framework: "REPORT_191_NATED_BUSINESS", family: "Business Management", verificationStatus: "PENDING_VERIFICATION" }
];

export const referenceDataQualitySnapshot = {
  activeColleges: tvetColleges.length,
  activeCampuses: campusSites.length,
  programmeCategories: programmeCategories.length,
  nationalProgrammes: programmeCatalogue.length,
  subjects: subjectRegistry.length,
  verifiedCampusOfferings: campusProgrammeOfferings.filter((offering) => offering.status === "VERIFIED").length,
  unverifiedCampusOfferings: campusProgrammeOfferings.filter((offering) => offering.status !== "VERIFIED").length,
  recordsRequiringReview: campusSites.filter((site) => site.verificationStatus === "PENDING_VERIFICATION" || site.verificationStatus === "UNKNOWN").length + programmeCatalogue.filter((programme) => programme.verificationStatus === "PENDING_VERIFICATION").length,
  curriculumVersions: 7,
  modules: 0,
  qualifications: 0,
  trades: 0,
  pendingReferenceRequests: 0,
  latestOfficialImport: "Official source records registered; full parser import pending"
};
