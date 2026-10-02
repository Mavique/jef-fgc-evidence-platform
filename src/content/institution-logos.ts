export type InstitutionLogoCategory = "tvet" | "national" | "municipalities";

export type InstitutionLogo = {
  category: InstitutionLogoCategory;
  format: "jpg" | "png" | "webp";
  height: number;
  name: string;
  slug: string;
  sourceUrl: string;
  src: string;
  verificationStatus: "verified-official-site" | "verified-official-linked-source";
  width: number;
};

export type OmittedInstitutionLogo = {
  category: InstitutionLogoCategory;
  name: string;
  reason: string;
  siteUrl: string;
  slug: string;
};

export const institutionLogos = [
  ["national", "png", 76, "merSETA", "merseta", "https://www.merseta.org.za/wp-content/uploads/2021/04/logo-1.png", "/images/institutions/national/merseta.png", "verified-official-site", 250],
  ["national", "png", 106, "Department of Basic Education", "department-of-basic-education", "https://www.education.gov.za/Portals/0/dbeLogo2.png?ver=2015-12-02-121800-540", "/images/institutions/national/department-of-basic-education.png", "verified-official-site", 1200],
  ["municipalities", "png", 167, "Sedibeng District Municipality", "sedibeng-district-municipality", "https://sedibeng.gov.za/compnts/sdmlogo_24.png", "/images/institutions/municipalities/sedibeng-district-municipality.png", "verified-official-site", 132],
  ["tvet", "png", 181, "Boland TVET College", "boland-tvet-college", "https://bolandcollege.com/wp-content/uploads/2022/11/Boland-Logo.png", "/images/institutions/tvet/boland-tvet-college.png", "verified-official-linked-source", 219],
  ["tvet", "png", 231, "Buffalo City TVET College", "buffalo-city-tvet-college", "https://bccollege.co.za/wp-content/uploads/2026/03/cropped-bcc-logo.png", "/images/institutions/tvet/buffalo-city-tvet-college.png", "verified-official-linked-source", 1446],
  ["tvet", "png", 499, "College of Cape Town", "college-of-cape-town", "https://www.cct.edu.za/cctblk_logo.png", "/images/institutions/tvet/college-of-cape-town.png", "verified-official-site", 2944],
  ["tvet", "png", 512, "Ehlanzeni TVET College", "ehlanzeni-tvet-college", "https://www.ehlanzenicollege.co.za/icon.png?icon.1s_ciwzg3ld9v.png", "/images/institutions/tvet/ehlanzeni-tvet-college.png", "verified-official-site", 512],
  ["tvet", "png", 104, "Ekurhuleni East TVET College", "ekurhuleni-east-tvet-college", "https://eec.edu.za/wp-content/uploads/2021/06/eec-LOGO.png", "/images/institutions/tvet/ekurhuleni-east-tvet-college.png", "verified-official-linked-source", 313],
  ["tvet", "jpg", 305, "Ekurhuleni West TVET College", "ekurhuleni-west-tvet-college", "https://www.ewc.edu.za/images/ewc-logo.JPG", "/images/institutions/tvet/ekurhuleni-west-tvet-college.jpg", "verified-official-site", 582],
  ["tvet", "jpg", 80, "Esayidi TVET College", "esayidi-tvet-college", "https://esayiditvet.co.za/2025/wp-content/uploads/2022/10/Esayidi-TVET-Logo-2022.jpg", "/images/institutions/tvet/esayidi-tvet-college.jpg", "verified-official-linked-source", 160],
  ["tvet", "png", 105, "Flavius Mareka TVET College", "flavius-mareka-tvet-college", "https://flaviusmareka.net/wp-content/uploads/2018/12/flavius-slider-logo-1.png", "/images/institutions/tvet/flavius-mareka-tvet-college.png", "verified-official-linked-source", 224],
  ["tvet", "png", 173, "King Hintsa TVET College", "king-hintsa-tvet-college", "https://www.khc.edu.za/wp-content/uploads/2022/11/khc-logo.png", "/images/institutions/tvet/king-hintsa-tvet-college.png", "verified-official-linked-source", 247],
  ["tvet", "png", 250, "King Sabata Dalindyebo TVET College", "king-sabata-dalindyebo-tvet-college", "https://ksdcollege.edu.za/sites/default/files/Branding%20TOP%202022_0.png", "/images/institutions/tvet/king-sabata-dalindyebo-tvet-college.png", "verified-official-site", 1920],
  ["tvet", "png", 97, "Port Elizabeth TVET College", "port-elizabeth-tvet-college", "https://www.pecollege.edu.za/wp-content/uploads/2024/09/rgb_horizontal-01-01-01-300x97.png", "/images/institutions/tvet/port-elizabeth-tvet-college.png", "verified-official-site", 300],
  ["tvet", "png", 300, "Sedibeng TVET College", "sedibeng-tvet-college", "https://www.sedcol.co.za/images/Logo-edited.png", "/images/institutions/tvet/sedibeng-tvet-college.png", "verified-official-site", 1000],
  ["tvet", "png", 601, "South Cape TVET College", "south-cape-tvet-college", "https://sccollege.co.za/wp-content/uploads/2022/04/SCC-Vertical-Logo.png", "/images/institutions/tvet/south-cape-tvet-college.png", "verified-official-linked-source", 631],
  ["tvet", "png", 32, "South West Gauteng TVET College", "south-west-gauteng-tvet-college", "https://www.swgc.co.za/wp-content/uploads/2022/08/cropped-Screenshot-2022-08-13-at-02.15.28-32x32.png", "/images/institutions/tvet/south-west-gauteng-tvet-college.png", "verified-official-site", 32],
  ["tvet", "png", 156, "uMfolozi TVET College", "umfolozi-tvet-college", "https://umfolozicollege.co.za/wp-content/uploads/2025/02/logo-test2.png", "/images/institutions/tvet/umfolozi-tvet-college.png", "verified-official-site", 1498],
  ["tvet", "png", 115, "Vuselela TVET College", "vuselela-tvet-college", "https://vuselelacollege.co.za/wp-content/uploads/2023/03/vuselela_logo-c-300x115.png", "/images/institutions/tvet/vuselela-tvet-college.png", "verified-official-linked-source", 300],
  ["tvet", "png", 146, "West Coast TVET College", "west-coast-tvet-college", "https://www.westcoastcollege.co.za/wcc2/wp-content/uploads/2025/05/logo-32-1024x146.png", "/images/institutions/tvet/west-coast-tvet-college.png", "verified-official-site", 1024],
  ["tvet", "png", 244, "Western TVET College", "western-tvet-college", "https://westcol.co.za/wp-content/uploads/2025/09/Westcol-College-Logo-Main-scaled.png", "/images/institutions/tvet/western-tvet-college.png", "verified-official-linked-source", 2560]
].map(([category, format, height, name, slug, sourceUrl, src, verificationStatus, width]) => ({
  category,
  format,
  height,
  name,
  slug,
  sourceUrl,
  src,
  verificationStatus,
  width
})) as readonly InstitutionLogo[];

export const omittedInstitutionLogos = [
  ["tvet", "Eastcape Midlands TVET College", "Official site returned 404 during verification.", "https://www.emcol.co.za", "eastcape-midlands-tvet-college"],
  ["tvet", "Ikhala TVET College", "Official site did not expose a verifiable logo candidate.", "https://www.ikhalacollege.co.za", "ikhala-tvet-college"],
  ["tvet", "Ingwe TVET College", "Official site could not be fetched during verification.", "https://www.ingwecollege.co.za", "ingwe-tvet-college"],
  ["tvet", "Lovedale TVET College", "Official site did not expose a verifiable logo candidate.", "https://www.lovedalecollege.co.za", "lovedale-tvet-college"],
  ["tvet", "Goldfields TVET College", "Official site could not be fetched during verification.", "https://www.goldfieldsfet.edu.za", "goldfields-tvet-college"],
  ["tvet", "Maluti TVET College", "Official site could not be fetched during verification.", "https://www.malutifet.org.za", "maluti-tvet-college"],
  ["tvet", "Motheo TVET College", "Official site did not expose a verifiable logo candidate.", "https://www.motheofet.co.za", "motheo-tvet-college"],
  ["tvet", "Central Johannesburg TVET College", "Official site did not expose a verifiable logo candidate.", "https://www.cjc.co.za", "central-johannesburg-tvet-college"],
  ["tvet", "Coastal KZN TVET College", "Only a standalone DHET logo was verifiable from the official site, not a college logo.", "https://www.coastalkzn.co.za", "coastal-kzn-tvet-college"],
  ["tvet", "Elangeni TVET College", "Official site did not expose a verifiable logo candidate.", "https://www.efet.co.za", "elangeni-tvet-college"],
  ["tvet", "Majuba TVET College", "Official logo candidates were protected by remote 403 responses.", "https://www.majuba.edu.za", "majuba-tvet-college"],
  ["tvet", "Mnambithi TVET College", "Only a standalone DHET logo was verifiable from the official site, not a college logo.", "https://www.mnambithicollege.co.za", "mnambithi-tvet-college"],
  ["tvet", "Mthashana TVET College", "Official site could not be fetched during verification.", "https://www.mthashanafet.co.za", "mthashana-tvet-college"],
  ["tvet", "Thekwini TVET College", "Official site did not expose a verifiable logo candidate.", "https://www.thekwinicollege.co.za", "thekwini-tvet-college"],
  ["tvet", "Umgungundlovu TVET College", "Official site could not be fetched during verification.", "https://www.ufetc.edu.za", "umgungundlovu-tvet-college"],
  ["tvet", "Capricorn TVET College", "Official site returned 403 during verification.", "https://www.capricorncollege.edu.za", "capricorn-tvet-college"],
  ["tvet", "Lephalale TVET College", "Official site could not be fetched during verification.", "https://www.lephalalefetcollege.co.za", "lephalale-tvet-college"],
  ["tvet", "Letaba TVET College", "Official site could not be fetched during verification.", "https://www.letabafet.co.za", "letaba-tvet-college"],
  ["tvet", "Mopani South East TVET College", "Official site did not expose a verifiable logo candidate.", "https://www.mopanicollege.edu.za", "mopani-south-east-tvet-college"],
  ["tvet", "Sekhukhune TVET College", "Official site could not be fetched during verification.", "https://www.sekfetcol.co.za", "sekhukhune-tvet-college"],
  ["tvet", "Vhembe TVET College", "Official site could not be fetched during verification.", "https://www.vhembefet.co.za", "vhembe-tvet-college"],
  ["tvet", "Waterberg TVET College", "Only a standalone DHET logo was verifiable from the official site, not a college logo.", "https://www.waterbergcollege.co.za", "waterberg-tvet-college"],
  ["tvet", "Gert Sibande TVET College", "Official site could not be fetched during verification.", "https://www.gscollege.co.za", "gert-sibande-tvet-college"],
  ["tvet", "Nkangala TVET College", "Official site could not be fetched during verification.", "https://www.nkangalafet.edu.za", "nkangala-tvet-college"],
  ["tvet", "Northern Cape Rural TVET College", "Official site could not be fetched during verification.", "https://www.ncrfet.edu.za", "northern-cape-rural-tvet-college"],
  ["tvet", "Northern Cape Urban TVET College", "Official site could not be fetched during verification.", "https://www.ncufetcollege.edu.za", "northern-cape-urban-tvet-college"],
  ["tvet", "Orbit TVET College", "Official site did not expose a verifiable logo candidate.", "https://www.orbitcollege.co.za", "orbit-tvet-college"],
  ["tvet", "Taletso TVET College", "Official site did not expose a verifiable logo candidate.", "https://www.taletsofetcollege.co.za", "taletso-tvet-college"],
  ["tvet", "False Bay TVET College", "Only a standalone DHET logo was verifiable from the official site, not a college logo.", "https://www.falsebaycollege.co.za", "false-bay-tvet-college"],
  ["tvet", "Northlink TVET College", "Only a standalone DHET logo was verifiable from the official site, not a college logo.", "https://www.northlink.co.za", "northlink-tvet-college"],
  ["tvet", "Tshwane North TVET College", "Only a standalone DHET logo was verifiable from the official site, not a college logo.", "https://www.tnc.edu.za", "tshwane-north-tvet-college"],
  ["tvet", "Tshwane South TVET College", "Official site returned 503 during verification.", "https://www.tsc.edu.za", "tshwane-south-tvet-college"],
  ["municipalities", "Lejweleputswa District Municipality", "Official site could not be fetched during verification and no official local logo asset was available.", "https://www.lejweleputswa.fs.gov.za", "lejweleputswa-district-municipality"]
].map(([category, name, reason, siteUrl, slug]) => ({
  category,
  name,
  reason,
  siteUrl,
  slug
})) as readonly OmittedInstitutionLogo[];

export function validateInstitutionLogoInventory(
  logos: readonly InstitutionLogo[],
  assetExists: (src: string) => boolean = () => true
) {
  const slugs = new Set<string>();
  const missingAssets: string[] = [];
  const duplicateSlugs: string[] = [];
  const missingDimensions: string[] = [];

  for (const logo of logos) {
    if (slugs.has(logo.slug)) {
      duplicateSlugs.push(logo.slug);
    }
    slugs.add(logo.slug);

    if (!assetExists(logo.src)) {
      missingAssets.push(logo.src);
    }

    if (logo.width <= 0 || logo.height <= 0) {
      missingDimensions.push(logo.slug);
    }
  }

  return {
    duplicateSlugs,
    missingAssets,
    missingDimensions,
    valid: duplicateSlugs.length === 0 && missingAssets.length === 0 && missingDimensions.length === 0
  };
}
