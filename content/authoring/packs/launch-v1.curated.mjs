// Human-reviewed launch facts. The builder only joins these records to the accepted
// inventory/release ledgers and expands the explicit question blueprints; it does
// not invent uses, features, distractors, or comparison directions.

export const statewideSources = [
  {
    id: "nys.dcs.entry-level-guide",
    title: "Test Guide for the Entry-Level Custodians and Janitors Series",
    publisher: "New York State Department of Civil Service",
    evidenceTier: "official-primary",
    version: "Content Last Updated 2023; PDF verified 2026-08-25",
    locator: "Introduction, PDF pages 1–2",
    scope: "Official title, entry-level series boundary, three subject areas, and announcement-controls-exact-subject notice.",
    rightsNotes: "New York State government publication; short exact excerpts retained for offline educational citation.",
    url: "https://www.cs.ny.gov/testing/test_guides/Custodians_Janitors_EntryLevel_TestGuide.pdf"
  }
]

export const statewideEvidence = [
  {
    claimId: "claim.statewide.series-identity",
    lineId: "line.statewide.series-identity",
    sourceId: "nys.dcs.entry-level-guide",
    locator: "Title and Introduction, PDF pages 1–2",
    excerpt: "Test Guide for the Entry-Level Custodians and Janitors Series. The New York State Department of Civil Service has developed this test guide to familiarize you with the multiple-choice test for the Entry-Level Custodians and Janitors Series.",
    text: "The official New York State guide identifies an Entry-Level Custodians and Janitors Series."
  },
  {
    claimId: "claim.statewide.subject-plan",
    lineId: "line.statewide.subject-plan",
    sourceId: "nys.dcs.entry-level-guide",
    locator: "Introduction, PDF page 2, subject areas 1–3",
    excerpt: "CLEANING TOOLS AND THEIR USES; TOOLS USED FOR MINOR MAINTENANCE AND REPAIR; HEALTH AND SAFETY ISSUES IN CUSTODIAL WORK.",
    text: "The official entry-level guide describes the three supported content domains."
  },
  {
    claimId: "claim.statewide.announcement-controls",
    lineId: "line.statewide.announcement-controls",
    sourceId: "nys.dcs.entry-level-guide",
    locator: "Introduction, PDF page 2, first paragraph",
    excerpt: "The Examination Announcement will specify the exact subject areas to be included on the particular examination you will be taking.",
    text: "A controlling examination announcement, not the generic guide, determines the exact subjects for a particular examination."
  }
]

export const nassauSources = [
  {
    id: "nassau.oc.60112026",
    title: "Custodian Open Competitive Exam 60112026",
    publisher: "Nassau County Civil Service Commission",
    evidenceTier: "official-primary",
    version: "posting 5338780 accessed 2026-08-25",
    locator: "GovernmentJobs posting 5338780",
    scope: "Controlling open-competitive announcement for filing, fee, qualifications, employer scope, date, and subject plan.",
    rightsNotes: "Short factual excerpts retained for offline educational citation; the official announcement controls.",
    url: "https://www.governmentjobs.com/careers/nassaucountyny/jobs/newprint/5338780"
  },
  {
    id: "nassau.promo.61012026",
    title: "Custodian Promotion Exam 61012026",
    publisher: "Nassau County Civil Service Commission",
    evidenceTier: "official-primary",
    version: "posting 5339570 accessed 2026-08-25",
    locator: "GovernmentJobs posting 5339570",
    scope: "Controlling promotion announcement and amendments for filing, fee, qualifications, date, jurisdictions, and seniority credit.",
    rightsNotes: "Short factual excerpts retained for offline educational citation; the official announcement controls.",
    url: "https://www.governmentjobs.com/careers/nassaucountyny/jobs/newprint/5339570"
  },
  {
    id: "nassau.factbase",
    title: "Maintained Nassau Custodian factbase",
    publisher: "NY Custodian Exam research project",
    evidenceTier: "official-primary-synthesis",
    version: "2026-08-25 refresh",
    locator: "docs/FACTBASE.md — Exam identity & series and introductory current-status note",
    scope: "Separates verified official announcement facts from historical inference and unresolved administration status.",
    rightsNotes: "Repository-authored synthesis; official linked records control."
  },
  {
    id: "nassau.open-items",
    title: "Maintained Nassau unresolved-fact ledger",
    publisher: "NY Custodian Exam research project",
    evidenceTier: "maintained-editorial-synthesis",
    version: "2026-08-25 refresh",
    locator: "docs/OPEN.md#high-priority-unresolved-items",
    scope: "Explicit unknowns for preparer identity, item counts, administration logistics, review mechanics, and class specifications.",
    rightsNotes: "Repository-authored research ledger."
  }
]

export const nassauEvidence = [
  {
    claimId: "claim.nassau.oc-filing",
    lineId: "line.nassau.oc-filing",
    sourceId: "nassau.oc.60112026",
    locator: "Posting header",
    excerpt: "JOB TYPE Open Competitive; JOB NUMBER 60112026; OPENING DATE 06/11/2026; CLOSING DATE 7/1/2026 11:59 PM Eastern; EXAM DATE August 22, 2026; FEE $50.00.",
    text: "Open-competitive 60112026 opened June 11, closed July 1 at 11:59 PM Eastern, listed an August 22 exam date, and charged $50."
  },
  {
    claimId: "claim.nassau.oc-employers",
    lineId: "line.nassau.oc-employers",
    sourceId: "nassau.oc.60112026",
    locator: "Salary & Other Information → ANNOUNCED FOR",
    excerpt: "NASSAU COUNTY SCHOOL DISTRICTS, SCHOOL DISTRICT LIBRARIES, BOARD OF COOPERATIVE EDUCATIONAL SERVICES, VILLAGES AND SPECIAL DISTRICTS",
    text: "The open-competitive announcement covered Nassau County school districts, school district libraries, BOCES, villages, and special districts."
  },
  {
    claimId: "claim.nassau.oc-qualifications",
    lineId: "line.nassau.oc-qualifications",
    sourceId: "nassau.oc.60112026",
    locator: "Minimum Qualifications → Training and Experience, items 1–3",
    excerpt: "Must be met on or before the closing date: 1. One year of satisfactory experience in building cleaning and maintenance work; or 2. Six months of satisfactory experience as a carpenter, plumber, electrician, painter, mechanic, steam firer, or other related maintenance work; or 3. One year of satisfactory experience as a Cleaner in a Nassau County school district.",
    text: "By the filing deadline, OC candidates needed one of the announcement's three experience routes: one year building cleaning and maintenance; six months in a listed trade or other related maintenance work; or one year as a Cleaner in a Nassau County school district."
  },
  {
    claimId: "claim.nassau.oc-residency",
    lineId: "line.nassau.oc-residency",
    sourceId: "nassau.oc.60112026",
    locator: "Supplemental Information → RESIDENCY; General Information → 5. RESIDENCY",
    excerpt: "To fulfill the standard residency requirements, each candidate for open competitive examination must have been a bona fide resident and dweller of Nassau County for at least one year immediately preceding the advertised date of examination and maintain that residency until appointed from the eligible list established as a result of the examination. NOTE: RESIDENTS OF FARMINGDALE UFSD NO. 22 WHO LIVE IN SUFFOLK COUNTY MAY PARTICIPATE IN THIS EXAMINATION BUT WILL BE ELIGIBLE FOR APPOINTMENT ONLY IN THAT SCHOOL DISTRICT. NOTE: THE VILLAGE OF FREEPORT HAS A SPECIAL RESIDENCE REQUIREMENT WHICH MUST BE SATISFIED.",
    text: "The OC announcement states the standard one-year Nassau residency and continuation rule, a Farmingdale UFSD No. 22 Suffolk-resident exception limited to that district, and a special Village of Freeport residence requirement."
  },
  {
    claimId: "claim.nassau.subject-plan",
    lineId: "line.nassau.subject-plan",
    sourceId: "nassau.oc.60112026",
    locator: "SUBJECT OF EXAMINATION, areas 1–3",
    excerpt: "SUBJECT OF EXAMINATION: A written test designed to evaluate knowledge, skills and /or abilities in the following areas: 1. CLEANING TOOLS AND THEIR USES; 2. TOOLS USED FOR MINOR MAINTENANCE AND REPAIR; 3. HEALTH AND SAFETY ISSUES IN CUSTODIAL WORK.",
    text: "The Nassau announcement specifies a written test using the three Entry-Level Custodians and Janitors subject areas."
  },
  {
    claimId: "claim.nassau.promo-filing",
    lineId: "line.nassau.promo-filing",
    sourceId: "nassau.promo.61012026",
    locator: "Posting header and Salary & Other Information → amendments",
    excerpt: "JOB TYPE Promotion; JOB NUMBER 61012026; OPENING DATE 06/11/2026; CLOSING DATE 7/5/2026 11:59 PM Eastern; EXAM DATE August 22, 2026; FEE $50.00. APPLICATIONS ACCEPTED TO JULY 5, 2026 for this added jurisdiction only.",
    text: "Promotion 61012026 opened June 11, listed August 22, charged $50, and the July 5 filing date applied only to the later-added Jericho Public Library jurisdiction."
  },
  {
    claimId: "claim.nassau.promo-jurisdictions",
    lineId: "line.nassau.promo-jurisdictions",
    sourceId: "nassau.promo.61012026",
    locator: "Salary & Other Information → ANNOUNCED FOR",
    excerpt: "BALDWIN UNION FREE SCHOOL DISTRICT (S103); BELLMORE MEMORIAL LIBRARY (L305); BELLMORE-MERRICK CENTRAL HIGH SCHOOL DISTRICT (S105); BETHPAGE UNION FREE SCHOOL DISTRICT (S113); BOARD OF COOPERATIVE EDUCATIONAL SERVICES (S290); EAST MEADOW UNION FREE SCHOOL DISTRICT (S120); EAST ROCKAWAY UNION FREE SCHOOL DISTRICT (S123); FARMINGDALE UNION FREE SCHOOL DISTRICT (S133); FLORAL PARK-BELLEROSE UNION FREE SCHOOL DISTRICT (S135); FRANKLIN SQUARE UNION FREE SCHOOL DISTRICT (S140); FREEPORT UNION FREE SCHOOL DISTRICT (S143); GARDEN CITY UNION FREE SCHOOL DISTRICT (S145); GREAT NECK UNION FREE SCHOOL DISTRICT (S150); HERRICKS UNION FREE SCHOOL DISTRICT (S155); HEWLETT WOODMERE UNION FREE SCHOOL DISTRICT (S160); ISLAND TREES UNION FREE SCHOOL DISTRICT (S170); JERICHO UNION FREE PUBLIC SCHOOL (S172); LAWRENCE UNION FREE SCHOOL DISTRICT (S175); LEVITTOWN UNION FREE SCHOOL DISTRICT (S180); LOCUST VALLEY UNION FREE SCHOOL DISTRICT (S183); MANHASSET UNION FREE SCHOOL DISTRICT (S193); MASSAPEQUA UNION FREE SCHOOL DISTRICT (S195); MERRICK UNION FREE SCHOOL DISTRICT (S200); NORTH BELLMORE UNION FREE SCHOOL DISTRICT (S210); NORTH MERRICK UNION FREE SCHOOL DISTRICT (S213); NORTH SHORE CENTRAL SCHOOL DISTRICT (S215); PLAINEDGE UNION FREE SCHOOL DISTRICT (S225); PLAINVIEW-OLD BETHPAGE CENTRAL SCHOOL DISTRICT (S230); PORT WASHINGTON UNION FREE SCHOOL DISTRICT (S233); ROCKVILLE CENTRE UNION FREE SCHOOL DISTRICT (S235); SEWANHAKA CENTRAL HIGH SCHOOL DISTRICT (S250); SYOSSET CENTRAL SCHOOL DISTRICT (S253); SYOSSET PUBLIC LIBRARY (L390); UNIONDALE UNION FREE SCHOOL DISTRICT (S255); VALLEY STREAM CENTRAL HIGH SCHOOL DISTRICT #1 (S270); VALLEY STREAM UNION FREE SCHOOL DISTRICT #13 (S260); VALLEY STREAM UNION FREE SCHOOL DISTRICT #24 (S263); WANTAGH UNION FREE SCHOOL DISTRICT (S273); WESTBURY MEMORIAL PUBLIC LIBRARY (L395); WESTBURY UNION FREE SCHOOL DISTRICT (S275); WEST HEMPSTEAD UNION FREE SCHOOL DISTRICT (S280).",
    text: "The promotion announcement initially named 41 participating jurisdictions."
  },
  {
    claimId: "claim.nassau.promo-amendments",
    lineId: "line.nassau.promo-amendments",
    sourceId: "nassau.promo.61012026",
    locator: "Salary & Other Information → amendments dated 6/18/2026 and 6/26/2026",
    excerpt: "Announcement amended 6/18/26 to add the following jurisdiction: LYNBROOK UNION FREE SCHOOL DISTRICT (S185). Announcement amended 6/26/26 to add the following jurisdiction: JERICHO PUBLIC LIBRARY (L345). APPLICATIONS ACCEPTED TO JULY 5, 2026 for this added jurisdiction only.",
    text: "Promotion amendments added Lynbrook and later Jericho Public Library; the July 5 filing allowance was jurisdiction-specific to Jericho."
  },
  {
    claimId: "claim.nassau.promo-qualifications",
    lineId: "line.nassau.promo-qualifications",
    sourceId: "nassau.promo.61012026",
    locator: "Minimum Qualifications",
    excerpt: "Must be met on or before the date of the written test: Candidates must be employed by the JURISDICTION IN WHICH PROMOTION IS SOUGHT and must be serving and have served continuously, in the jurisdiction in which promotion is sought, on a continuous basis in the non-competitive class for two years immediately preceding the date of the written test as CLEANER and, for promotion to the title of CUSTODIAN such service must continue to the date of appointment. NOTE: Part-time employees who meet the minimum qualifications would qualify for this promotion.",
    text: "Promotion candidates had to be employed in the jurisdiction in which promotion was sought and have two continuous years of non-competitive-class Cleaner service there immediately before the written test; service had to continue through appointment, and qualifying part-time employees were eligible."
  },
  {
    claimId: "claim.nassau.promo-provisional",
    lineId: "line.nassau.promo-provisional",
    sourceId: "nassau.promo.61012026",
    locator: "Minimum Qualifications → Civil Service Law §52.10(a) note",
    excerpt: "NOTE: According to Civil Service Law, section 52.10(a) which became effective September 4, 2024, time served provisionally immediately preceding permanent appointment shall count towards meeting the time in title and the employee shall be eligible to take the promotion examination.",
    text: "The announcement states that qualifying provisional time immediately before permanent appointment counts toward time in title under Civil Service Law §52.10(a)."
  },
  {
    claimId: "claim.nassau.promo-subject-plan",
    lineId: "line.nassau.promo-subject-plan",
    sourceId: "nassau.promo.61012026",
    locator: "SUBJECT OF EXAMINATION, areas 1–3",
    excerpt: "SUBJECT OF EXAMINATION: A written test designed to evaluate knowledge, skills and /or abilities in the following areas: 1. CLEANING TOOLS AND THEIR USES; 2. TOOLS USED FOR MINOR MAINTENANCE AND REPAIR; 3. HEALTH AND SAFETY ISSUES IN CUSTODIAL WORK.",
    text: "The Nassau promotion announcement specifies a written test using the three Entry-Level Custodians and Janitors subject areas."
  },
  {
    claimId: "claim.nassau.promo-seniority",
    lineId: "line.nassau.promo-seniority",
    sourceId: "nassau.promo.61012026",
    locator: "Supplemental Information → SENIORITY",
    excerpt: "SENIORITY: One tenth (.10) of a point will be added to a passing score for each six months of continuous permanent competitive class service (such service to include time served in the examination title on provisional promotion basis) in the jurisdiction in which promotion is sought, up to a maximum of twenty years (4 points). Such service must continue to the date of appointment.",
    text: "The promotion announcement adds 0.10 point to a passing score per six months of specified continuous service in the promotion jurisdiction, includes provisional-promotion time in the examination title, caps credit at twenty years/four points, and requires service through appointment."
  },
  {
    claimId: "claim.nassau.admin-status-unknown",
    lineId: "line.nassau.admin-status-unknown",
    sourceId: "nassau.factbase",
    locator: "docs/FACTBASE.md — introductory current-status note",
    excerpt: "The announcements for exams 60112026 / 61012026 list 2026-08-22 as the exam date. That date has passed, but no official post-administration notice or result/list record was located in the 2026-08-25 read-only refresh, so actual administration status remains unconfirmed.",
    text: "Actual administration of the announced 2026 exam remains unconfirmed in the maintained evidence."
  },
  {
    claimId: "claim.nassau.preparer-unknown",
    lineId: "line.nassau.preparer-unknown",
    sourceId: "nassau.open-items",
    locator: "docs/OPEN.md — C1 preparer identity",
    excerpt: "This makes DCS preparation probable, but the announcement language itself does not expressly identify the preparer.",
    text: "The preparer identity remains unresolved."
  },
  {
    claimId: "claim.nassau.scoring-unknown",
    lineId: "line.nassau.scoring-unknown",
    sourceId: "nassau.open-items",
    locator: "docs/OPEN.md — C2 item count/weighting/conversion",
    excerpt: "No controlling source located for item count, equal weighting, conversion formula, or unscored items.",
    text: "Official item counts, weighting, unscored items, and score conversion remain unresolved."
  },
  {
    claimId: "claim.nassau.section-minima-unknown",
    lineId: "line.nassau.section-minima-unknown",
    sourceId: "nassau.open-items",
    locator: "docs/OPEN.md — C8 section/subdivision passing minima",
    excerpt: "Rule allows such action with notice; no Custodian-specific exercise has been established.",
    text: "Current section or subdivision passing minima remain unresolved."
  },
  {
    claimId: "claim.nassau.review-form-unknown",
    lineId: "line.nassau.review-form-unknown",
    sourceId: "nassau.open-items",
    locator: "docs/OPEN.md — C7 current Custodian review mechanics",
    excerpt: "Exact current logistics have not been published/recovered.",
    text: "Current review mechanics remain unresolved."
  },
  {
    claimId: "claim.nassau.form-identity-unknown",
    lineId: "line.nassau.form-identity-unknown",
    sourceId: "nassau.open-items",
    locator: "docs/OPEN.md — C4 shared OC/promotion form identity",
    excerpt: "When Nassau administers OC and promotion Custodian exams on the same date with the same subject plan, do candidates receive the same booklet/form?",
    text: "Current open-competitive and promotion form identity remains unresolved."
  }
]

const reviewedOn = "2026-08-25"
const verifiedFact = (
  id,
  category,
  label,
  appliesToExamNumbers,
  value,
  sourceLineIds,
  effectiveFrom
) => ({
  id,
  category,
  label,
  state: "verified",
  appliesToExamNumbers,
  value,
  detail: null,
  reviewedOn,
  effectiveFrom,
  effectiveThrough: null,
  sourceLineIds,
  conflictingValues: [],
  supersededByFactId: null
})
const unavailableFact = (
  id,
  category,
  label,
  state,
  appliesToExamNumbers,
  detail,
  sourceLineIds
) => ({
  id,
  category,
  label,
  state,
  appliesToExamNumbers,
  value: null,
  detail,
  reviewedOn,
  effectiveFrom: null,
  effectiveThrough: null,
  sourceLineIds,
  conflictingValues: [],
  supersededByFactId: null
})
const supersededFact = (
  id,
  category,
  label,
  appliesToExamNumbers,
  value,
  detail,
  sourceLineIds,
  effectiveFrom,
  effectiveThrough,
  supersededByFactId
) => ({
  id,
  category,
  label,
  state: "superseded",
  appliesToExamNumbers,
  value,
  detail,
  reviewedOn,
  effectiveFrom,
  effectiveThrough,
  sourceLineIds,
  conflictingValues: [],
  supersededByFactId
})

const oc = ["60112026"]
const promo = ["61012026"]
const bothNassauExams = ["60112026", "61012026"]

export const launchProfiles = [
  {
    id: "nys-entry-level-custodians-janitors",
    version: 2,
    label: "New York Entry-Level Custodians and Janitors",
    jurisdiction: "New York statewide entry-level series",
    canonicalPath: "/ny/",
    layer: "statewide-series",
    parentProfileId: null,
    audience: "Learners preparing for a jurisdiction whose controlling announcement uses the statewide entry-level plan.",
    scopeNotes: [
      "Covers cleaning tools and uses, minor-maintenance tools and uses, and custodial health and safety.",
      "The official guide says the controlling announcement specifies the exact subjects for a particular examination.",
      "Does not claim an official item count, subject weighting, raw-score conversion, or secure-question coverage."
    ],
    announcementFactSheet: null,
    examIdentityState: "not_applicable",
    examIdentities: [],
    competitionTypeState: "not_applicable",
    competitionTypes: [],
    seriesLevel: "entry-level",
    testPlanCompatibility: {
      status: "compatible",
      compatibilityKey: "nys-entry-level-custodians-janitors-v2",
      detail: "The launch pack covers the official guide's three entry-level subject areas; a specific announcement still controls exact inclusion.",
      sourceLineIds: [
        "line.statewide.series-identity",
        "line.statewide.subject-plan",
        "line.statewide.announcement-controls"
      ]
    },
    contentAvailability: {
      status: "available",
      detail: "The reviewed English launch atlas, questions, and hazard scenes are available for this series profile.",
      lastVerifiedOn: reviewedOn
    },
    series: "entry-level-custodians-janitors",
    compatibilityKey: "nys-entry-level-custodians-janitors-v2",
    disclaimer: "Original site-designed practice only; not an official, past, recalled, or reconstructed exam.",
    sourceIds: ["nys.dcs.entry-level-guide"]
  },
  {
    id: "nassau-county-custodian-entry-level",
    version: 2,
    label: "Nassau County Custodian — Entry-Level Series Layer",
    jurisdiction: "Nassau County public employers covered by the controlling announcements",
    canonicalPath: "/ny/nassau-county/custodian/",
    layer: "jurisdiction",
    parentProfileId: "nys-entry-level-custodians-janitors",
    audience: "Nassau Custodian open-competitive and promotion candidates whose controlling announcements use the statewide three-subject entry plan.",
    scopeNotes: [
      "Maps Nassau announcement facts to the statewide corpus without claiming Nassau authored these questions or illustrations.",
      "The controlling announcement and admission notice govern eligibility, participation, dates, administration, and instructions."
    ],
    announcementFactSheet: {
      schemaVersion: 2,
      version: 2,
      lastReviewedOn: reviewedOn,
      controllingDocumentNotice: "The announcement for a specific exam controls its title, competition type, eligibility, participating jurisdictions, filing terms, and subjects; the admission notice controls administration-specific instructions.",
      seriesScopeDisclaimer: "This layer supports original site-designed practice. It does not establish official item counts or weights, identical open and promotion forms, preparer identity, or secure content.",
      facts: [
        verifiedFact("oc-filing-period", "filing_period", "Open-competitive filing period", oc, "Opened June 11, 2026 and closed July 1, 2026 at 11:59 PM Eastern.", ["line.nassau.oc-filing"], "2026-06-11"),
        verifiedFact("oc-exam-date", "exam_date", "Open-competitive announced exam date", oc, "August 22, 2026.", ["line.nassau.oc-filing"], "2026-06-11"),
        verifiedFact("oc-fee", "fee", "Open-competitive application fee", oc, "$50.00.", ["line.nassau.oc-filing"], "2026-06-11"),
        verifiedFact("oc-jurisdictions", "jurisdictions", "Open-competitive employer and residency scope", oc, "Announced for Nassau County school districts, school district libraries, BOCES, villages, and special districts. The announcement states the standard one-year Nassau residency/continuation rule, a Farmingdale UFSD No. 22 Suffolk-resident exception limited to that district, and a special Village of Freeport residence requirement.", ["line.nassau.oc-employers", "line.nassau.oc-residency"], "2026-06-11"),
        verifiedFact("oc-qualifications", "qualifications", "Open-competitive minimum qualifications", oc, "By the closing date, one of three routes: one year of satisfactory building-cleaning-and-maintenance experience; six months of satisfactory experience in a listed trade or other related maintenance work; or one year of satisfactory experience as Cleaner in a Nassau County school district.", ["line.nassau.oc-qualifications"], "2026-06-11"),
        verifiedFact("promo-filing-period", "filing_period", "Promotion filing period", promo, "Opened June 11, 2026. Applications for the later-added Jericho Public Library jurisdiction alone were accepted through July 5, 2026.", ["line.nassau.promo-filing", "line.nassau.promo-amendments"], "2026-06-11"),
        verifiedFact("promo-exam-date", "exam_date", "Promotion announced exam date", promo, "August 22, 2026.", ["line.nassau.promo-filing"], "2026-06-11"),
        verifiedFact("promo-fee", "fee", "Promotion application fee", promo, "$50.00.", ["line.nassau.promo-filing"], "2026-06-11"),
        supersededFact("promo-jurisdictions-original", "jurisdictions", "Original promotion jurisdiction list", promo, "41 jurisdictions in the original ANNOUNCED FOR list.", "Superseded when Lynbrook Union Free School District was added June 18, 2026.", ["line.nassau.promo-jurisdictions", "line.nassau.promo-amendments"], "2026-06-11", "2026-06-17", "promo-jurisdictions-lynbrook"),
        supersededFact("promo-jurisdictions-lynbrook", "jurisdictions", "Promotion jurisdictions after first amendment", promo, "The original 41 jurisdictions plus Lynbrook Union Free School District.", "Superseded when Jericho Public Library was added June 26, 2026.", ["line.nassau.promo-jurisdictions", "line.nassau.promo-amendments"], "2026-06-18", "2026-06-25", "promo-jurisdictions-current"),
        verifiedFact("promo-jurisdictions-current", "jurisdictions", "Current promotion jurisdiction list", promo, "43 jurisdictions: the original 41 named jurisdictions, plus Lynbrook Union Free School District and Jericho Public Library; the Jericho-only application extension ran through July 5, 2026.", ["line.nassau.promo-jurisdictions", "line.nassau.promo-amendments"], "2026-06-26"),
        verifiedFact("promo-qualifications", "qualifications", "Promotion minimum qualifications", promo, "Employment in the jurisdiction in which promotion was sought; two continuous years there in the non-competitive class as Cleaner immediately before the written test; continued service through appointment; qualifying part-time employees eligible. Under the announcement's Civil Service Law §52.10(a) note, qualifying provisional time immediately preceding permanent appointment counts toward time in title.", ["line.nassau.promo-qualifications", "line.nassau.promo-provisional"], "2026-06-11"),
        verifiedFact("subject-plan", "subjects", "Announced subject plan", bothNassauExams, "Cleaning Tools and Their Uses; Tools Used for Minor Maintenance and Repair; Health and Safety Issues in Custodial Work.", ["line.nassau.subject-plan", "line.nassau.promo-subject-plan", "line.statewide.subject-plan"], "2026-06-11"),
        verifiedFact("written-medium", "medium", "Announced test medium", bothNassauExams, "Written test.", ["line.nassau.subject-plan", "line.nassau.promo-subject-plan"], "2026-06-11"),
        unavailableFact("official-item-count", "counts", "Official item count", "not_published", bothNassauExams, "The maintained controlling sources do not publish an official scored-item count or unscored-item count.", ["line.nassau.scoring-unknown"]),
        unavailableFact("official-subject-weights", "weights", "Official subject weights", "not_published", bothNassauExams, "The maintained controlling sources do not publish official subject weights.", ["line.nassau.scoring-unknown"]),
        unavailableFact("official-score-conversion", "scoring", "Official score conversion and section minima", "unverified", bothNassauExams, "The maintained source set does not establish the raw-to-final conversion or a current section minimum.", ["line.nassau.scoring-unknown", "line.nassau.section-minima-unknown"]),
        unavailableFact("current-review-procedure", "review", "Current post-exam review procedure", "unverified", bothNassauExams, "Current post-exam review mechanics remain unresolved in the maintained source set.", ["line.nassau.review-form-unknown"]),
        unavailableFact("current-form-identity", "form_identity", "Open/promotion form identity", "not_published", bothNassauExams, "The maintained controlling sources do not establish whether the open-competitive and promotion examinations use identical forms.", ["line.nassau.form-identity-unknown"]),
        verifiedFact("promo-seniority-credit", "seniority_credit", "Promotion seniority credit", promo, "0.10 point added to a passing score per six months of specified continuous service in the promotion jurisdiction, including stated provisional-promotion time; maximum twenty years/four points; service continues through appointment.", ["line.nassau.promo-seniority"], "2026-06-11"),
        unavailableFact("administration-status", "administration_status", "Actual 2026 administration status", "unverified", bothNassauExams, "The announced date passed, but the refresh did not locate an official post-administration or result/list record confirming administration occurred as announced.", ["line.nassau.admin-status-unknown"]),
        unavailableFact("preparer-identity", "preparer_identity", "Exam preparer identity", "unverified", bothNassauExams, "The maintained corpus does not directly confirm the preparer for this Nassau administration.", ["line.nassau.preparer-unknown"])
      ],
      changeHistory: [
        {
          version: 1,
          changedOn: "2026-08-25",
          summary: "Created the Nassau launch layer with direct 2026 OC and promotion announcement closure and explicit unresolved-fact boundaries.",
          sourceLineIds: ["line.nassau.oc-filing", "line.nassau.promo-filing", "line.nassau.admin-status-unknown"]
        },
        {
          version: 2,
          changedOn: "2026-08-25",
          summary: "Added six-state fact wrappers, effective-dated promotion jurisdiction history, exact announcement excerpts, residency and provisional-service notes, and explicit exam identity/compatibility/availability.",
          sourceLineIds: ["line.nassau.oc-residency", "line.nassau.promo-amendments", "line.nassau.promo-provisional", "line.statewide.subject-plan"]
        }
      ]
    },
    examIdentityState: "verified",
    examIdentities: [
      {
        examNumber: "60112026",
        title: "Custodian",
        competitionType: "open-competitive",
        sourceLineIds: ["line.nassau.oc-filing"]
      },
      {
        examNumber: "61012026",
        title: "Custodian",
        competitionType: "promotion",
        sourceLineIds: ["line.nassau.promo-filing"]
      }
    ],
    competitionTypeState: "verified",
    competitionTypes: ["open-competitive", "promotion"],
    seriesLevel: "entry-level",
    testPlanCompatibility: {
      status: "compatible",
      compatibilityKey: "nassau-county-custodian-entry-level-v2",
      detail: "Both controlling Nassau announcements use the three subject areas in the official New York entry-level guide.",
      sourceLineIds: ["line.nassau.subject-plan", "line.nassau.promo-subject-plan", "line.statewide.subject-plan"]
    },
    contentAvailability: {
      status: "available",
      detail: "The reviewed English launch content is available for both listed Nassau exam identities.",
      lastVerifiedOn: reviewedOn
    },
    series: "entry-level-custodians-janitors",
    compatibilityKey: "nassau-county-custodian-entry-level-v2",
    disclaimer: "Original site-designed practice mapped to the verified subject plan; not an official Nassau exam, score forecast, or source of secure questions.",
    sourceIds: [
      "nys.dcs.entry-level-guide",
      "nassau.oc.60112026",
      "nassau.promo.61012026",
      "nassau.factbase",
      "nassau.open-items"
    ]
  }
]

export const toolFacts = [
  {
    id: "tool.scrub-brush",
    domain: "cleaning-tools-and-uses",
    useSummary: "Scrubs or washes an appropriate surface with a bristled working head.",
    features: ["bristled working head", "form intended for manual scrubbing"],
    usePrompt: "Which tool uses a bristled head to scrub or wash an appropriate surface?",
    useDistractors: ["tool.staple-gun", "ppe.protective-gloves", "tool.dustpan"]
  },
  {
    id: "tool.staple-gun",
    domain: "minor-maintenance-and-repair",
    useSummary: "Drives staples to fasten suitable materials.",
    features: ["squeeze lever above the body", "staple outlet at the nose"],
    usePrompt: "Which tool drives staples to fasten suitable materials?",
    useDistractors: ["tool.hammer.claw", "tool.screwdriver.phillips", "tool.clamp.c"],
    featurePrompt: "Which tool is recognized by a squeeze lever above its body and a staple outlet at the nose?",
    featureDistractors: ["tool.utility-knife", "tool.hand-plane", "tool.pliers.locking"]
  },
  {
    id: "ppe.protective-gloves",
    domain: "health-and-safety",
    useSummary: "Provides task-appropriate hand protection selected for the hazard or product.",
    features: ["paired hand coverings", "separate finger shapes"],
    usePrompt: "Which item provides task-appropriate hand protection selected for the hazard or product?",
    useDistractors: ["ppe.safety-glasses", "ppe.ear-plugs", "safety.wet-floor-sign"]
  },
  {
    id: "tool.push-broom",
    domain: "cleaning-tools-and-uses",
    useSummary: "Sweeps larger floor or area debris with a broad head.",
    features: ["broad horizontal bristle head", "long handle"],
    usePrompt: "Which tool is intended to sweep larger floor or area debris with a broad head?",
    useDistractors: ["tool.deck-brush", "tool.dustpan", "tool.window-squeegee"]
  },
  {
    id: "tool.angle-broom",
    domain: "cleaning-tools-and-uses",
    useSummary: "Sweeps corners and general dry debris.",
    features: ["angled bristle head", "long household-broom handle"],
    usePrompt: "Which tool is suited to sweeping corners and general dry debris?",
    useDistractors: ["tool.floor-squeegee", "tool.duster", "tool.toilet-bowl-brush"],
    featurePrompt: "Which tool is recognized by an angled bristle head on a long household-broom handle?",
    featureDistractors: ["tool.push-broom", "tool.deck-brush", "tool.dust-mop"]
  },
  {
    id: "tool.dust-mop",
    domain: "cleaning-tools-and-uses",
    useSummary: "Collects dry dust and fine debris from floors.",
    features: ["broad low-profile floor head", "dry dusting yarn or pad"],
    usePrompt: "Which tool collects dry dust and fine debris from floors?",
    useDistractors: ["tool.wet-mop", "tool.window-strip-washer", "tool.duster"]
  },
  {
    id: "tool.wet-mop",
    domain: "cleaning-tools-and-uses",
    useSummary: "Applies or picks up liquid during appropriate wet floor cleaning.",
    features: ["absorbent string head", "long floor-cleaning handle"],
    usePrompt: "Which tool applies or picks up liquid during appropriate wet floor cleaning?",
    useDistractors: ["tool.dust-mop", "tool.push-broom", "tool.duster"]
  },
  {
    id: "tool.flat-mop",
    domain: "cleaning-tools-and-uses",
    useSummary: "Performs damp or wet floor cleaning with the pad system intended for the task.",
    features: ["low rectangular frame", "flat replaceable or reusable pad"],
    usePrompt: "Which tool performs damp or wet floor cleaning with a flat pad system?",
    useDistractors: ["tool.dustpan", "tool.angle-broom", "tool.window-squeegee"],
    featurePrompt: "Which tool is recognized by a low rectangular frame carrying a flat cleaning pad?",
    featureDistractors: ["tool.dust-mop", "tool.wet-mop", "tool.floor-squeegee"]
  },
  {
    id: "equipment.mop-bucket-wringer",
    domain: "cleaning-tools-and-uses",
    useSummary: "Holds solution or rinse water and wrings a wet mop.",
    features: ["bucket basin", "integrated wringer press"],
    usePrompt: "Which equipment holds solution or rinse water and provides a wringer for a wet mop?",
    useDistractors: ["equipment.janitor-cart", "equipment.dolly", "tool.dustpan"],
    featurePrompt: "Which equipment is recognized by a bucket basin with an integrated wringer press?",
    featureDistractors: ["equipment.janitor-cart", "equipment.hand-truck", "equipment.dolly"]
  },
  {
    id: "tool.deck-brush",
    domain: "cleaning-tools-and-uses",
    useSummary: "Scrubs durable floors or surfaces with a stiff brush head.",
    features: ["stiff rectangular bristle head", "long scrubbing handle"],
    usePrompt: "Which long-handled tool scrubs durable floors or surfaces with a stiff brush head?",
    useDistractors: ["tool.angle-broom", "tool.floor-squeegee", "tool.dust-mop"]
  },
  {
    id: "tool.hand-scrub-brush",
    domain: "cleaning-tools-and-uses",
    useSummary: "Performs manual scrubbing in a compact hand-held form.",
    features: ["compact hand grip", "short dense bristles"],
    usePrompt: "Which compact hand-held tool is intended for manual scrubbing?",
    useDistractors: ["tool.dustpan", "tool.duster", "tool.toilet-bowl-brush"],
    featurePrompt: "Which tool is recognized by a compact hand grip over short dense bristles?",
    featureDistractors: ["tool.deck-brush", "tool.push-broom", "tool.window-strip-washer"]
  },
  {
    id: "tool.toilet-bowl-brush",
    domain: "cleaning-tools-and-uses",
    useSummary: "Cleans the interior of a toilet bowl.",
    features: ["narrow handle", "rounded or curved bristle head for bowl access"],
    usePrompt: "Which tool is intended specifically for cleaning the interior of a toilet bowl?",
    useDistractors: ["tool.hand-scrub-brush", "tool.duster", "tool.window-strip-washer"],
    featurePrompt: "Which tool is recognized by a narrow handle and a bristle head shaped for bowl access?",
    featureDistractors: ["tool.hand-scrub-brush", "tool.duster", "tool.dustpan"]
  },
  {
    id: "tool.duster",
    domain: "cleaning-tools-and-uses",
    useSummary: "Removes light dust from surfaces.",
    features: ["soft feather or synthetic fibers", "lightweight handle"],
    usePrompt: "Which tool removes light dust from surfaces with soft fibers?",
    useDistractors: ["tool.hand-scrub-brush", "tool.dustpan", "tool.window-squeegee"],
    featurePrompt: "Which tool is recognized by a lightweight handle carrying soft feather-like or synthetic fibers?",
    featureDistractors: ["tool.toilet-bowl-brush", "tool.angle-broom", "tool.window-strip-washer"]
  },
  {
    id: "tool.dustpan",
    domain: "cleaning-tools-and-uses",
    useSummary: "Collects debris after it has been swept together.",
    features: ["shallow collection tray", "straight pickup lip"],
    usePrompt: "Which tool collects debris after it has been swept together?",
    useDistractors: ["tool.duster", "tool.floor-squeegee", "equipment.mop-bucket-wringer"],
    featurePrompt: "Which tool is recognized by a shallow collection tray with a straight pickup lip?",
    featureDistractors: ["tool.putty-knife", "tool.paint-scraper", "tool.square"]
  },
  {
    id: "tool.floor-squeegee",
    domain: "cleaning-tools-and-uses",
    useSummary: "Moves liquid across a floor with a broad blade.",
    features: ["long handle", "broad floor-width rubber blade"],
    usePrompt: "Which tool moves liquid across a floor with a broad blade?",
    useDistractors: ["tool.window-squeegee", "tool.dust-mop", "tool.push-broom"]
  },
  {
    id: "tool.window-squeegee",
    domain: "cleaning-tools-and-uses",
    useSummary: "Removes liquid from glass or a window surface.",
    features: ["short handle", "rubber blade held in a window channel"],
    usePrompt: "Which tool removes liquid from glass or a window surface?",
    useDistractors: ["tool.window-strip-washer", "tool.floor-squeegee", "tool.duster"]
  },
  {
    id: "tool.window-strip-washer",
    domain: "cleaning-tools-and-uses",
    useSummary: "Applies and agitates window-cleaning solution before removal.",
    features: ["short T-shaped holder", "absorbent strip-washer sleeve"],
    usePrompt: "Which tool applies and agitates window-cleaning solution before the liquid is removed?",
    useDistractors: ["tool.window-squeegee", "tool.floor-squeegee", "tool.duster"],
    featurePrompt: "Which window tool is recognized by an absorbent sleeve on a short T-shaped holder rather than a rubber blade?",
    featureDistractors: ["tool.window-squeegee", "tool.floor-squeegee", "tool.hand-scrub-brush"]
  },
  {
    id: "equipment.janitor-cart",
    domain: "cleaning-tools-and-uses",
    useSummary: "Transports custodial supplies, tools, or waste as its configuration permits.",
    features: ["wheeled multi-compartment frame", "shelves or bag supports"],
    usePrompt: "Which equipment transports a collection of custodial supplies, tools, or waste?",
    useDistractors: ["equipment.hand-truck", "equipment.dolly", "equipment.mop-bucket-wringer"],
    featurePrompt: "Which equipment is recognized by a wheeled multi-compartment frame with shelves or bag supports?",
    featureDistractors: ["equipment.hand-truck", "equipment.dolly", "equipment.mop-bucket-wringer"]
  },
  {
    id: "equipment.hand-truck",
    domain: "cleaning-tools-and-uses",
    useSummary: "Moves a load supported upright on a two-wheel frame and toe plate.",
    features: ["upright frame with handles", "two wheels and a bottom toe plate"],
    usePrompt: "Which equipment moves a load supported upright on a two-wheel frame and toe plate?",
    useDistractors: ["equipment.dolly", "equipment.janitor-cart", "equipment.mop-bucket-wringer"],
    featurePrompt: "Which equipment is recognized by an upright handled frame, two wheels, and a bottom toe plate?",
    featureDistractors: ["equipment.dolly", "equipment.janitor-cart", "access.stepladder"]
  },
  {
    id: "equipment.dolly",
    domain: "cleaning-tools-and-uses",
    useSummary: "Moves equipment or loads on a low wheeled platform.",
    features: ["low load platform", "small casters beneath the platform"],
    usePrompt: "Which equipment moves a load on a low wheeled platform?",
    useDistractors: ["equipment.hand-truck", "equipment.janitor-cart", "equipment.mop-bucket-wringer"],
    featurePrompt: "Which equipment is recognized by a low load platform carried on small casters?",
    featureDistractors: ["equipment.hand-truck", "equipment.janitor-cart", "access.stepladder"]
  },
  {
    id: "equipment.vacuum.upright",
    domain: "cleaning-tools-and-uses",
    useSummary: "Dry-vacuums floors or carpets when the machine is designed for the surface.",
    features: ["upright handle and body", "floor nozzle integrated at the base"]
  },
  {
    id: "equipment.vacuum.canister",
    domain: "cleaning-tools-and-uses",
    useSummary: "Dry-vacuums with a separate canister connected to a hose and cleaning head.",
    features: ["separate wheeled canister", "hose and wand assembly"],
    usePrompt: "Which vacuum uses a separate canister connected to a hose and cleaning head?",
    useDistractors: ["equipment.vacuum.wet-dry", "equipment.steam-cleaner", "equipment.hand-truck"],
    featurePrompt: "Which vacuum is recognized by a separate wheeled canister with a hose and wand assembly?",
    featureDistractors: ["equipment.vacuum.wet-dry", "equipment.steam-cleaner", "equipment.janitor-cart"]
  },
  {
    id: "equipment.vacuum.wet-dry",
    domain: "cleaning-tools-and-uses",
    useSummary: "Picks up wet or dry material only when designed and configured for that material.",
    features: ["tank-style body", "flexible suction hose"],
    usePrompt: "Which vacuum may pick up wet or dry material only when it is designed and configured for that material?",
    useDistractors: ["equipment.vacuum.canister", "equipment.steam-cleaner", "equipment.dolly"],
    featurePrompt: "Which vacuum is recognized by a tank-style body and flexible suction hose?",
    featureDistractors: ["equipment.vacuum.canister", "equipment.janitor-cart", "equipment.steam-cleaner"]
  },
  {
    id: "equipment.carpet-extractor",
    domain: "cleaning-tools-and-uses",
    useSummary: "Applies and recovers cleaning solution during a carpet-cleaning process.",
    features: ["representative upright extraction body", "solution-recovery floor head"]
  },
  {
    id: "equipment.steam-cleaner",
    domain: "cleaning-tools-and-uses",
    useSummary: "Performs steam-cleaning tasks according to the equipment instructions.",
    features: ["steam-producing equipment body", "hose or task attachment"],
    usePrompt: "Which equipment performs steam-cleaning tasks according to its instructions?",
    useDistractors: ["equipment.vacuum.canister", "equipment.vacuum.wet-dry", "equipment.hand-truck"]
  },
  {
    id: "equipment.floor-machine.low-speed",
    domain: "cleaning-tools-and-uses",
    useSummary: "Performs broad floor scrubbing, spray-buffing, or stripping-type tasks depending on the fitted pad or brush and process.",
    features: ["representative rotary floor-machine chassis", "handle controlling a circular pad or brush"]
  },
  {
    id: "equipment.burnisher.high-speed",
    domain: "cleaning-tools-and-uses",
    useSummary: "Polishes or burnishes compatible finished floors.",
    features: ["representative burnisher chassis", "floor-polishing pad housing"]
  },
  {
    id: "equipment.vacuum.ride-on",
    domain: "cleaning-tools-and-uses",
    useSummary: "Vacuums large areas in a ride-on industrial configuration.",
    features: ["operator seat and controls", "large ride-on cleaning chassis"]
  },
  {
    id: "equipment.snow-blower",
    domain: "cleaning-tools-and-uses",
    useSummary: "Performs mechanized snow removal at recognition and basic-safety level only.",
    features: ["snow intake housing", "discharge chute"]
  },
  {
    id: "equipment.hedge-trimmer",
    domain: "cleaning-tools-and-uses",
    useSummary: "Trims hedges or shrubs at recognition and basic-safety level only.",
    features: ["long reciprocating cutting bar", "two-hand control form"]
  },
  {
    id: "tool.hammer.claw",
    domain: "minor-maintenance-and-repair",
    useSummary: "Drives nails and pulls suitable nails with its claw.",
    features: ["flat striking face", "split curved claw"],
    usePrompt: "Which hammer both drives nails and pulls suitable nails with a claw?",
    useDistractors: ["tool.hammer.ball-peen", "tool.mallet.rubber", "tool.staple-gun"]
  },
  {
    id: "tool.hammer.ball-peen",
    domain: "minor-maintenance-and-repair",
    useSummary: "Performs appropriate metalworking or general striking tasks with a rounded peen.",
    features: ["flat striking face", "rounded hemispherical peen"],
    usePrompt: "Which hammer uses a rounded peen for appropriate metalworking or general striking tasks?",
    useDistractors: ["tool.hammer.claw", "tool.mallet.rubber", "tool.hand-plane"]
  },
  {
    id: "tool.mallet.rubber",
    domain: "minor-maintenance-and-repair",
    useSummary: "Strikes suitable work with less surface damage than a metal hammer where appropriate.",
    features: ["nonmetal cylindrical head", "two broad striking faces"],
    usePrompt: "Which striking tool is chosen when a nonmetal head can reduce surface damage compared with a metal hammer?",
    useDistractors: ["tool.hammer.claw", "tool.hammer.ball-peen", "tool.hand-plane"],
    featurePrompt: "Which striking tool is recognized by a nonmetal cylindrical head with two broad faces?",
    featureDistractors: ["tool.hammer.claw", "tool.hammer.ball-peen", "tool.staple-gun"]
  },
  {
    id: "tool.screwdriver.slotted",
    domain: "minor-maintenance-and-repair",
    useSummary: "Turns compatible screws with a single straight slot.",
    features: ["flat blade tip", "single straight driving edge"],
    usePrompt: "Which screwdriver turns a compatible screw with a single straight slot?",
    useDistractors: ["tool.screwdriver.phillips", "tool.adjustable-wrench", "tool.utility-knife"],
    featurePrompt: "Which screwdriver is recognized by a flat blade tip with one straight driving edge?",
    featureDistractors: ["tool.screwdriver.phillips", "tool.utility-knife", "tool.putty-knife"]
  },
  {
    id: "tool.screwdriver.phillips",
    domain: "minor-maintenance-and-repair",
    useSummary: "Turns compatible screws with a cross-shaped recess.",
    features: ["cross-shaped driver tip", "four driving flutes"],
    usePrompt: "Which screwdriver turns a compatible screw with a cross-shaped recess?",
    useDistractors: ["tool.screwdriver.slotted", "tool.adjustable-wrench", "tool.utility-knife"],
    featurePrompt: "Which screwdriver is recognized by a cross-shaped tip with four driving flutes?",
    featureDistractors: ["tool.screwdriver.slotted", "tool.utility-knife", "tool.putty-knife"]
  },
  {
    id: "tool.adjustable-wrench",
    domain: "minor-maintenance-and-repair",
    useSummary: "Turns compatible nuts and bolts with adjustable smooth jaws.",
    features: ["smooth parallel jaws", "visible worm gear for jaw adjustment"],
    usePrompt: "Which tool uses adjustable smooth jaws to turn compatible nuts and bolts?",
    useDistractors: ["tool.pipe-wrench", "tool.wrench.fixed", "tool.pliers.slip-joint"]
  },
  {
    id: "tool.pipe-wrench",
    domain: "minor-maintenance-and-repair",
    useSummary: "Grips and turns pipe or round fittings with serrated jaws.",
    features: ["serrated offset hook and heel jaws", "long adjustable body"],
    usePrompt: "Which tool is designed to grip and turn round pipe and fittings?",
    useDistractors: ["tool.adjustable-wrench", "tool.wrench.fixed", "tool.pliers.slip-joint"]
  },
  {
    id: "tool.wrench.fixed",
    domain: "minor-maintenance-and-repair",
    useSummary: "Turns matching nuts and bolts with a fixed-size open or box end.",
    features: ["fixed-size opening", "open end, box end, or both"],
    usePrompt: "Which tool turns matching nuts and bolts with a fixed-size open or box end?",
    useDistractors: ["tool.adjustable-wrench", "tool.pipe-wrench", "tool.pliers.slip-joint"],
    featurePrompt: "Which wrench is recognized by a fixed-size open end, box end, or combination of both?",
    featureDistractors: ["tool.adjustable-wrench", "tool.pipe-wrench", "tool.pliers.tongue-groove"]
  },
  {
    id: "tool.pliers.slip-joint",
    domain: "minor-maintenance-and-repair",
    useSummary: "Grips or turns varied objects within the tool's limits.",
    features: ["two-position sliding pivot", "general-purpose gripping jaws"],
    usePrompt: "Which type of general-purpose pliers grips or turns varied objects using a two-position pivot?",
    useDistractors: ["tool.pliers.tongue-groove", "tool.pliers.needle-nose", "tool.pliers.diagonal-cutting"]
  },
  {
    id: "tool.pliers.tongue-groove",
    domain: "minor-maintenance-and-repair",
    useSummary: "Adjusts through multiple positions to grip larger or irregular objects.",
    features: ["multi-position tongue-and-groove channel", "offset serrated jaws"],
    usePrompt: "Which type of pliers adjusts through multiple channel positions to grip larger or irregular objects?",
    useDistractors: ["tool.pliers.slip-joint", "tool.pliers.needle-nose", "tool.adjustable-wrench"]
  },
  {
    id: "tool.pliers.needle-nose",
    domain: "minor-maintenance-and-repair",
    useSummary: "Grips or bends small objects in confined spaces.",
    features: ["long tapered gripping jaws", "narrow pointed nose"],
    usePrompt: "Which type of pliers uses long narrow jaws to grip or bend small objects in confined spaces?",
    useDistractors: ["tool.pliers.diagonal-cutting", "tool.pliers.slip-joint", "tool.pliers.locking"]
  },
  {
    id: "tool.pliers.diagonal-cutting",
    domain: "minor-maintenance-and-repair",
    useSummary: "Cuts wire or other material within the tool's rating.",
    features: ["opposed diagonal cutting edges", "short cutting jaws"],
    usePrompt: "Which type of pliers is intended to cut wire or other material within its rating?",
    useDistractors: ["tool.pliers.needle-nose", "tool.pliers.slip-joint", "tool.pliers.locking"]
  },
  {
    id: "tool.pliers.locking",
    domain: "minor-maintenance-and-repair",
    useSummary: "Clamps or grips a workpiece with a locking action.",
    features: ["locking linkage", "handle release lever and adjustment screw"],
    usePrompt: "Which type of pliers clamps or grips a workpiece and holds through a locking action?",
    useDistractors: ["tool.pliers.slip-joint", "tool.clamp.c", "tool.clamp.bar"]
  },
  {
    id: "tool.clamp.c",
    domain: "minor-maintenance-and-repair",
    useSummary: "Holds workpieces together within the reach of a screw-operated C-shaped frame.",
    features: ["rigid C-shaped frame", "threaded clamping screw"],
    usePrompt: "Which tool holds workpieces within a rigid C-shaped frame by tightening a screw?",
    useDistractors: ["tool.pliers.locking", "tool.hand-plane", "tool.staple-gun"]
  },
  {
    id: "tool.clamp.bar",
    domain: "minor-maintenance-and-repair",
    useSummary: "Clamps wider workpieces with jaws positioned along a bar.",
    features: ["long straight bar", "fixed and sliding jaws"],
    usePrompt: "Which clamp holds wider workpieces with jaws positioned along a long bar?",
    useDistractors: ["tool.clamp.c", "tool.pliers.locking", "tool.hand-plane"]
  },
  {
    id: "tool.hand-plane",
    domain: "minor-maintenance-and-repair",
    useSummary: "Shaves or smooths a wood surface with a cutting iron in a flat sole.",
    features: ["flat sole", "cutting iron projecting through the body"],
    usePrompt: "Which hand tool shaves or smooths a wood surface with a cutting iron?",
    useDistractors: ["tool.saw.hacksaw", "tool.paint-scraper", "tool.staple-gun"],
    featurePrompt: "Which tool is recognized by a flat sole with a cutting iron projecting through its body?",
    featureDistractors: ["tool.putty-knife", "tool.paint-scraper", "tool.saw.hacksaw"]
  },
  {
    id: "tool.saw.crosscut",
    domain: "minor-maintenance-and-repair",
    useSummary: "Cuts across wood grain.",
    features: ["hand-saw blade", "tooth pattern intended for cross-grain cutting"]
  },
  {
    id: "tool.saw.rip",
    domain: "minor-maintenance-and-repair",
    useSummary: "Cuts with wood grain.",
    features: ["hand-saw blade", "tooth pattern intended for rip cutting"]
  },
  {
    id: "tool.saw.hacksaw",
    domain: "minor-maintenance-and-repair",
    useSummary: "Cuts suitable metal, plastic, or other material as permitted by the fitted blade.",
    features: ["narrow replaceable blade under tension", "open metal frame"],
    usePrompt: "Which saw cuts suitable metal or plastic when fitted with the appropriate blade?",
    useDistractors: ["tool.hand-plane", "tool.utility-knife", "tool.paint-scraper"],
    featurePrompt: "Which saw is recognized by a narrow replaceable blade held under tension in an open metal frame?",
    featureDistractors: ["tool.hand-plane", "tool.utility-knife", "tool.wrench.fixed"]
  },
  {
    id: "tool.utility-knife",
    domain: "minor-maintenance-and-repair",
    useSummary: "Cuts suitable sheet or other material with a guarded or retractable blade.",
    features: ["short replaceable blade", "handle that guards or retracts the blade"],
    usePrompt: "Which hand tool cuts suitable sheet material with a short guarded or retractable blade?",
    useDistractors: ["tool.putty-knife", "tool.paint-scraper", "tool.saw.hacksaw"],
    featurePrompt: "Which tool is recognized by a short replaceable blade that retracts into or is guarded by its handle?",
    featureDistractors: ["tool.putty-knife", "tool.paint-scraper", "tool.screwdriver.slotted"]
  },
  {
    id: "tool.putty-knife",
    domain: "minor-maintenance-and-repair",
    useSummary: "Applies putty or filler and performs suitable light scraping.",
    features: ["broad flexible spreading blade", "straight handle behind the blade"],
    usePrompt: "Which tool applies putty or filler with a broad spreading blade?",
    useDistractors: ["tool.paint-scraper", "tool.utility-knife", "tool.hand-plane"]
  },
  {
    id: "tool.paint-scraper",
    domain: "minor-maintenance-and-repair",
    useSummary: "Scrapes paint or residue from a suitable surface.",
    features: ["scraping blade", "handle geometry arranged for scraping force"],
    usePrompt: "Which tool is intended to scrape paint or residue from a suitable surface?",
    useDistractors: ["tool.putty-knife", "tool.utility-knife", "tool.hand-plane"]
  },
  {
    id: "tool.tape-measure",
    domain: "minor-maintenance-and-repair",
    useSummary: "Measures length or distance with a marked flexible tape.",
    features: ["marked flexible tape", "retracting case"],
    usePrompt: "Which tool measures length or distance with a marked flexible tape?",
    useDistractors: ["tool.level", "tool.square", "tool.wrench.fixed"],
    featurePrompt: "Which measuring tool is recognized by a marked flexible tape that retracts into a case?",
    featureDistractors: ["tool.level", "tool.square", "tool.wrench.fixed"]
  },
  {
    id: "tool.level",
    domain: "minor-maintenance-and-repair",
    useSummary: "Checks whether work is level or plumb.",
    features: ["straight rigid body", "one or more bubble vials"],
    usePrompt: "Which tool checks whether work is level or plumb?",
    useDistractors: ["tool.square", "tool.tape-measure", "tool.wrench.fixed"],
    featurePrompt: "Which tool is recognized by a straight rigid body containing one or more bubble vials?",
    featureDistractors: ["tool.square", "tool.tape-measure", "tool.wrench.fixed"]
  },
  {
    id: "tool.square",
    domain: "minor-maintenance-and-repair",
    useSummary: "Checks or marks right angles and related measurements according to the square type.",
    features: ["right-angle reference surfaces", "rigid blade and stock or L-shaped body"],
    usePrompt: "Which tool checks or marks a right angle?",
    useDistractors: ["tool.level", "tool.tape-measure", "tool.wrench.fixed"],
    featurePrompt: "Which tool is recognized by rigid reference surfaces arranged to establish a right angle?",
    featureDistractors: ["tool.level", "tool.tape-measure", "tool.wrench.fixed"]
  },
  {
    id: "tool.plunger.cup",
    domain: "minor-maintenance-and-repair",
    useSummary: "Clears a suitable flat-drain fixture such as a sink or tub by forming a cup seal.",
    features: ["plain flexible cup", "no extended lower toilet flange"],
    usePrompt: "Which plunger is suited to a flat-drain fixture because it forms a plain cup seal?",
    useDistractors: ["tool.plunger.flange", "tool.pipe-wrench", "tool.adjustable-wrench"]
  },
  {
    id: "tool.plunger.flange",
    domain: "minor-maintenance-and-repair",
    useSummary: "Plunges a toilet drain with an extended flange designed to seal the outlet.",
    features: ["flexible cup", "extended lower toilet flange"],
    usePrompt: "Which plunger is designed to seal a toilet outlet with an extended flange?",
    useDistractors: ["tool.plunger.cup", "tool.pipe-wrench", "tool.adjustable-wrench"]
  },
  {
    id: "tool.drain-snake",
    domain: "minor-maintenance-and-repair",
    useSummary: "Clears certain drain obstructions at a broad recognition level.",
    features: ["coiled flexible cable", "manual crank or feed housing"]
  },
  {
    id: "tool.pipe-reamer",
    domain: "minor-maintenance-and-repair",
    useSummary: "Removes burrs or reams cut pipe as the tool is designed.",
    features: ["tapered reaming head", "pipe-deburring cutting edges"]
  },
  {
    id: "tool.soldering-gun",
    domain: "minor-maintenance-and-repair",
    useSummary: "Heats a suitable soldering tip for appropriate work, without establishing skilled electrical repair as entry scope.",
    features: ["pistol-grip body", "heated loop or tip at the nose"]
  },
  {
    id: "access.stepladder",
    domain: "minor-maintenance-and-repair",
    useSummary: "Provides self-supporting access at an appropriate height when opened and used as designed.",
    features: ["self-supporting A-frame", "spreaders or bracing between sides"],
    usePrompt: "Which ladder provides self-supporting access when opened and used as designed?",
    useDistractors: ["access.extension-ladder", "equipment.hand-truck", "equipment.dolly"]
  },
  {
    id: "access.extension-ladder",
    domain: "minor-maintenance-and-repair",
    useSummary: "Provides non-self-supporting access when properly placed and secured.",
    features: ["overlapping rail sections", "non-self-supporting straight form"],
    usePrompt: "Which ladder provides non-self-supporting access and must be properly placed and secured?",
    useDistractors: ["access.stepladder", "equipment.hand-truck", "equipment.dolly"]
  },
  {
    id: "ppe.safety-glasses",
    domain: "health-and-safety",
    useSummary: "Provides eye protection from applicable hazards.",
    features: ["transparent protective lenses", "side coverage or wraparound eye frame"],
    usePrompt: "Which PPE provides eye protection from applicable hazards?",
    useDistractors: ["ppe.protective-gloves", "ppe.ear-plugs", "safety.wet-floor-sign"],
    featurePrompt: "Which PPE is recognized by transparent protective lenses with side coverage or a wraparound frame?",
    featureDistractors: ["ppe.protective-gloves", "ppe.ear-plugs", "safety.wet-floor-sign"]
  },
  {
    id: "ppe.ear-plugs",
    domain: "health-and-safety",
    useSummary: "Provides hearing protection where the exposure and hearing-protection program require it.",
    features: ["pair of small ear-insert protectors", "corded or uncorded form"],
    usePrompt: "Which PPE provides hearing protection where the exposure and program require it?",
    useDistractors: ["ppe.safety-glasses", "ppe.protective-gloves", "safety.wet-floor-sign"],
    featurePrompt: "Which PPE is recognized as a pair of small corded or uncorded ear-insert protectors?",
    featureDistractors: ["ppe.safety-glasses", "ppe.protective-gloves", "safety.wet-floor-sign"]
  },
  {
    id: "safety.wet-floor-sign",
    domain: "health-and-safety",
    useSummary: "Warns people and helps control pedestrian exposure to a wet or slippery area.",
    features: ["high-visibility freestanding sign or cone", "wet-floor warning symbol or wording"],
    usePrompt: "Which item warns people and helps control pedestrian exposure to a wet or slippery area?",
    useDistractors: ["ppe.safety-glasses", "ppe.protective-gloves", "tool.floor-squeegee"]
  }
]

export const comparisonQuestions = [
  {
    comparisonId: "comparison.pipe-adjustable-wrench",
    correctConceptId: "tool.pipe-wrench",
    prompt: "In the accepted wrench comparison, which tool has serrated offset hook-and-heel jaws rather than smooth parallel jaws and a worm gear?",
    correctExplanation: "Correct. The pipe wrench is identified by serrated offset hook-and-heel jaws for gripping round pipe.",
    incorrectExplanation: "The adjustable wrench has smooth parallel jaws and a visible worm gear; those are the opposite cues in this comparison."
  },
  {
    comparisonId: "comparison.cup-flange-plunger",
    correctConceptId: "tool.plunger.flange",
    prompt: "In the accepted plunger comparison, which tool has an extended lower flange beneath the cup?",
    correctExplanation: "Correct. The flange plunger has an extended lower flange designed to help seal a toilet outlet.",
    incorrectExplanation: "The cup plunger has a plain cup rim without the extended lower toilet flange."
  },
  {
    comparisonId: "comparison.claw-ball-peen-hammer",
    correctConceptId: "tool.hammer.ball-peen",
    prompt: "In the accepted hammer comparison, which tool has a rounded hemispherical peen rather than a split claw?",
    correctExplanation: "Correct. The ball-peen hammer has a rounded hemispherical peen.",
    incorrectExplanation: "The claw hammer has a split claw for pulling suitable nails, not a rounded peen."
  },
  {
    comparisonId: "comparison.step-extension-ladder",
    correctConceptId: "access.stepladder",
    prompt: "In the accepted ladder comparison, which tool is the self-supporting A-frame with spreaders?",
    correctExplanation: "Correct. The stepladder is self-supporting when opened as designed and shows A-frame geometry with spreaders.",
    incorrectExplanation: "The extension ladder has overlapping straight rails and is not self-supporting."
  },
  {
    comparisonId: "comparison.dust-wet-mop",
    correctConceptId: "tool.dust-mop",
    prompt: "In the accepted mop comparison, which tool has a broad low-profile dry-dusting head rather than an absorbent string head for wet cleaning?",
    correctExplanation: "Correct. The dust mop uses a broad low-profile head to collect dry dust and fine floor debris.",
    incorrectExplanation: "The wet/string mop uses absorbent strands to apply or pick up liquid during wet floor cleaning."
  },
  {
    comparisonId: "comparison.floor-window-squeegee",
    correctConceptId: "tool.floor-squeegee",
    prompt: "In the accepted squeegee comparison, which tool has the long handle and broad floor-width head?",
    correctExplanation: "Correct. The floor squeegee has a long handle and broad blade for moving liquid across floors.",
    incorrectExplanation: "The window squeegee has a short handle and window channel for removing liquid from glass."
  },
  {
    comparisonId: "comparison.slip-joint-tongue-groove-pliers",
    correctConceptId: "tool.pliers.tongue-groove",
    prompt: "In the accepted pliers comparison, which tool has a multi-position tongue-and-groove channel rather than a two-position slip pivot?",
    correctExplanation: "Correct. Tongue-and-groove pliers adjust through multiple positions along a channel.",
    incorrectExplanation: "Slip-joint pliers use a two-position slip pivot rather than a multi-position channel."
  },
  {
    comparisonId: "comparison.needle-nose-diagonal-pliers",
    correctConceptId: "tool.pliers.diagonal-cutting",
    prompt: "In the accepted pliers comparison, which tool has opposed cutting edges rather than long gripping jaws?",
    correctExplanation: "Correct. Diagonal cutting pliers have opposed cutting edges for material within their rating.",
    incorrectExplanation: "Needle-nose pliers have long tapered gripping jaws for small objects and confined spaces."
  },
  {
    comparisonId: "comparison.putty-knife-paint-scraper",
    correctConceptId: "tool.putty-knife",
    prompt: "In the accepted blade-tool comparison, which tool has the flexible spreading blade used to apply putty or filler?",
    correctExplanation: "Correct. The putty knife has a broad flexible spreading blade for putty or filler and suitable light scraping.",
    incorrectExplanation: "The paint scraper is arranged to scrape paint or residue rather than to spread putty or filler."
  },
  {
    comparisonId: "comparison.c-clamp-locking-bar-clamp",
    correctConceptId: "tool.clamp.bar",
    prompt: "In the accepted three-tool clamping comparison, which tool has fixed and sliding jaws positioned along a long straight bar?",
    correctExplanation: "Correct. The bar clamp places a fixed jaw and a sliding jaw along a long bar for wider workpieces.",
    incorrectExplanations: {
      "tool.clamp.c": "The C-clamp uses a rigid C-shaped screw frame rather than jaws sliding along a bar.",
      "tool.pliers.locking": "Locking pliers use a locking linkage and release lever rather than a long bar with sliding jaws."
    }
  },
  {
    comparisonId: "comparison.push-broom-deck-brush",
    correctConceptId: "tool.deck-brush",
    prompt: "In the accepted broom-and-brush comparison, which tool has stiff scrubbing-brush geometry rather than a sweeping head?",
    correctExplanation: "Correct. The deck brush has a stiff bristled head intended to scrub durable floors or surfaces.",
    incorrectExplanation: "The push broom has a broad sweeping head intended to move larger floor or area debris."
  }
]

// Explicit application blueprints replacing twelve semantically redundant
// tool-selection prompts. Each objective is anchored to the quoted official
// locator below; the pack builder only assigns opaque delivery identifiers.
export const applicationQuestions = [
  {
    sourceId: "osha.portable-ladder-quickcard",
    locator: "Portable Ladder Safety QuickCard — inspection prior to use / damaged-ladder disposition",
    excerpt: "Always inspect the ladder prior to using it. If the ladder is damaged, it must be removed from service and tagged until repaired or discarded.",
    claim: "Always inspect a portable ladder prior to using it; if it is damaged, remove it from service and tag it until repaired or discarded.",
    family: "ladder-safety",
    prompt: "Before using a portable ladder, a custodian finds a cracked rail. What is the safest next step?",
    options: [
      ["Remove it from service and tag it until repaired or discarded.", true],
      ["Use it only for a task below shoulder height.", false],
      ["Ask a coworker to hold the cracked rail.", false],
      ["Cover the crack and finish the shift.", false]
    ]
  },
  {
    sourceId: "osha.portable-ladder-quickcard",
    locator: "Portable Ladder Safety QuickCard — three-point contact",
    excerpt: "Always maintain a 3-point (two hands and a foot, or two feet and a hand) contact on the ladder when climbing.",
    claim: "Maintain three-point contact while climbing a portable ladder.",
    family: "ladder-safety",
    prompt: "A custodian must climb a portable ladder. Which climbing method follows the cited safety guidance?",
    options: [
      ["Keep two hands and one foot, or two feet and one hand, in contact.", true],
      ["Carry supplies in both hands while climbing slowly.", false],
      ["Hold one side rail with one hand and keep both feet moving.", false],
      ["Climb without hand contact if another worker watches.", false]
    ]
  },
  {
    sourceId: "osha.portable-ladder-quickcard",
    locator: "Portable Ladder Safety QuickCard — facing ladder / body centered",
    excerpt: "Keep your body near the middle of the step and always face the ladder while climbing (see diagram).",
    claim: "Face the ladder and keep the body centered while climbing.",
    family: "ladder-safety",
    prompt: "While climbing, where should a worker face and position their body?",
    options: [
      ["Face the ladder and stay near the middle of the step.", true],
      ["Face away from the ladder and lean toward the work.", false],
      ["Turn sideways and keep weight over one rail.", false],
      ["Face either way as long as both feet touch a step.", false]
    ]
  },
  {
    sourceId: "osha.portable-ladder-quickcard",
    locator: "Portable Ladder Safety QuickCard — self-supporting ladder configuration",
    excerpt: "Do not use a self-supporting ladder (e.g., step ladder) as a single ladder or in a partially closed position.",
    claim: "Do not use a self-supporting ladder folded or partially closed as a single ladder.",
    family: "ladder-safety",
    prompt: "A self-supporting ladder will not fully open in the available space. What should the custodian do?",
    options: [
      ["Choose a suitable access method instead of using it partly closed.", true],
      ["Lean the folded ladder against the wall for this one task.", false],
      ["Open it halfway and have another worker brace it.", false],
      ["Use it closed if the floor is level.", false]
    ]
  },
  {
    sourceId: "osha.ladder-general-industry",
    locator: "29 CFR 1910.23(c)(8)",
    excerpt: "The cap (if equipped) and top step of a stepladder are not used as steps;",
    claim: "Do not use a stepladder's cap or top step as a step.",
    family: "ladder-safety",
    prompt: "The work is just beyond reach from the permitted steps of a stepladder. What should the custodian do?",
    options: [
      ["Descend and select equipment that provides safe access without standing on the top step.", true],
      ["Stand on the top step briefly while holding the ceiling.", false],
      ["Place a box on a lower step to gain height.", false],
      ["Have a coworker steady the ladder while using the top step.", false]
    ]
  },
  {
    sourceId: "osha.ladder-construction",
    locator: "29 CFR 1926.1053(b)(9)",
    excerpt: "The area around the top and bottom of ladders shall be kept clear.",
    claim: "Keep the area around the top and bottom of a ladder clear.",
    caveat: "29 CFR 1926.1053(b)(9) is a construction-industry provision cited as specific safety evidence; this site does not present it as the controlling rule for every custodial workplace.",
    family: "ladder-safety",
    prompt: "Supplies are stacked around the foot of a ladder needed for a task. What should happen before climbing?",
    options: [
      ["Clear the area around the ladder's top and bottom.", true],
      ["Step over the supplies while keeping one hand on the rail.", false],
      ["Move only the tallest item and leave the rest in place.", false],
      ["Ask a coworker to warn people about the supplies.", false]
    ]
  },
  {
    sourceId: "osha.ppe-general",
    locator: "29 CFR 1910.132(d)(1)(i)",
    excerpt: "Select, and have each affected employee use, the types of PPE that will protect the affected employee from the hazards identified in the hazard assessment.",
    claim: "Select PPE that protects against the hazards identified by the workplace hazard assessment.",
    family: "ppe-selection",
    prompt: "A new cleaning task presents a splash hazard. How should the required PPE be chosen?",
    options: [
      ["Use the hazard assessment to select PPE that protects against the identified splash hazard.", true],
      ["Choose whichever PPE is closest to the work area.", false],
      ["Use the same gloves and eyewear required for every other task.", false],
      ["Let each worker choose based only on comfort.", false]
    ]
  },
  {
    sourceId: "osha.ppe-general",
    locator: "29 CFR 1910.132(e)",
    excerpt: "Defective or damaged personal protective equipment shall not be used.",
    claim: "Do not use defective or damaged PPE.",
    family: "ppe-selection",
    prompt: "A custodian notices a deep crack in required protective eyewear before a task. What should they do?",
    options: [
      ["Do not use the damaged eyewear; obtain serviceable required protection.", true],
      ["Wear it only for the shortest part of the task.", false],
      ["Tape the crack and use it until the shift ends.", false],
      ["Use it if no damage is visible from a distance.", false]
    ]
  },
  {
    sourceId: "osha.eye-face-protection",
    locator: "29 CFR 1910.133(a)(2)",
    excerpt: "The employer shall ensure that each affected employee uses eye protection that provides side protection when there is a hazard from flying objects.",
    claim: "Use eye protection with side protection when flying objects are a hazard.",
    family: "ppe-selection",
    prompt: "A maintenance task can send small particles sideways through the air. Which eye protection feature is required by the cited rule?",
    options: [
      ["Protection that includes side protection for the flying-object hazard.", true],
      ["Clear front lenses with open sides.", false],
      ["Dark lenses without regard to side coverage.", false],
      ["Ordinary eyewear worn beneath a face covering.", false]
    ]
  },
  {
    sourceId: "osha.walking-working-surfaces",
    locator: "29 CFR 1910.22(a)(2)-(3)",
    excerpt: "The floor of each workroom is maintained in a clean and, to the extent feasible, in a dry condition. Walking-working surfaces are maintained free of hazards such as sharp or protruding objects, loose boards, corrosion, leaks, spills, snow, and ice.",
    claim: "Keep workroom floors clean and, to the extent feasible, dry, and keep walking-working surfaces free of spill hazards.",
    family: "walking-working-surfaces",
    prompt: "A liquid spill creates a walking hazard in a workroom. What is the appropriate response?",
    options: [
      ["Remove the spill hazard so the floor is clean and, when feasible, dry.", true],
      ["Leave it until the next scheduled floor-cleaning cycle.", false],
      ["Cover it with paper and reopen the area.", false],
      ["Move the spill toward a doorway so it is easier to see.", false]
    ]
  },
  {
    sourceId: "osha.walking-working-surfaces",
    locator: "29 CFR 1910.22(a)(1)",
    excerpt: "All places of employment, passageways, storerooms, service rooms, and walking-working surfaces are kept in a clean, orderly, and sanitary condition.",
    claim: "Keep passageways and walking-working surfaces clean and orderly.",
    family: "walking-working-surfaces",
    prompt: "Boxes have been left in a frequently used passageway. What should the custodian do?",
    options: [
      ["Remove or properly store them so the passageway is clean and orderly.", true],
      ["Stack them higher against one side of the passageway.", false],
      ["Leave them if people can turn sideways to pass.", false],
      ["Mark the boxes with a sign and keep them in the passageway.", false]
    ]
  },
  {
    sourceId: "osha.hand-tools",
    locator: "29 CFR 1926.301(b)",
    excerpt: "Wrenches, including adjustable, pipe, end, and socket wrenches shall not be used when jaws are sprung to the point that slippage occurs.",
    claim: "Do not use a wrench whose sprung jaws can slip.",
    caveat: "29 CFR 1926.301(b) is a construction-industry provision cited as specific safety evidence; this site does not present it as the controlling rule for every custodial workplace.",
    family: "hand-tool-safety",
    prompt: "An adjustable wrench has sprung jaws that slip under load. What should the custodian do?",
    options: [
      ["Remove the unsafe wrench from use and obtain a serviceable tool.", true],
      ["Tighten the adjustment harder and continue.", false],
      ["Use it only on smaller fasteners.", false],
      ["Add a pipe over the handle for more leverage.", false]
    ]
  }
]
