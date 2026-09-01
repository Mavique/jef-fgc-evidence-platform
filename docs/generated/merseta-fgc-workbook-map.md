# Workbook: merSETA EON FGC Evidence Tracker - September 2026.xlsx
Sheets: Dashboard, Setup, Learner Usage, Lecturer Assessment, Experience Register, Actions, Evidence Index, Lists

## Dashboard
Rows: 18; Columns: 8

FGC EVIDENCE VALIDATION DASHBOARD |  |  |  |  |  |  | 
Live summary driven by the evidence registers. Enter evidence only in the operational sheets. |  |  |  |  |  |  | 
 |  |  |  |  |  |  | 
Question 1 — Learner Usage |  |  |  | Question 2 — Lecturer Capability |  |  | 
 |  |  |  |  |  |  | 
Metric | Result |  |  | Metric | Result |  | 
Verified learner-use records | =COUNTIF('Learner Usage'!$L$5:$L$104,"Verified") |  |  | Lecturers assessed | =COUNTIF('Lecturer Assessment'!$R$5:$R$104,"<>Not Assessed") |  | 
Active learners recorded | =SUMIFS('Learner Usage'!$J$5:$J$104,'Learner Usage'!$L$5:$L$104,"Verified") |  |  | Independent | =COUNTIF('Lecturer Assessment'!$R$5:$R$104,"Independent") |  | 
Colleges represented | =IFERROR(SUMPRODUCT(('Learner Usage'!$B$5:$B$104<>"")/COUNTIF('Learner Usage'!$B$5:$B$104,'Learner Usage'!$B$5:$B$104&"")),0) |  |  | Support required | =COUNTIF('Lecturer Assessment'!$R$5:$R$104,"Partially Independent / Support Required") |  | 
Not verified / contradicted | =COUNTIF('Learner Usage'!$L$5:$L$104,"Not Verified")+COUNTIF('Learner Usage'!$L$5:$L$104,"Contradicted") |  |  | Not yet demonstrated | =COUNTIF('Lecturer Assessment'!$R$5:$R$104,"Not Yet Demonstrated") |  | 
Most common use context | Review Learner Usage filters |  |  | Independent rate | =IF(F7=0,0,F8/F7) |  | 
 |  |  |  | Published experiences | =COUNTIF('Experience Register'!$E$5:$E$104,"<>") |  | 
 |  |  |  |  |  |  | 
FGC report drafting prompts |  |  |  |  |  |  | 
Question 1: Report the verified period, dominant use times and contexts, coverage, evidence, non-use and causes.

Question 2: Report lecturers assessed, capability numbers and rates, published outputs, evidence, limitations and corrective actions. |  |  |  |  |  |  | 
 |  |  |  |  |  |  | 
 |  |  |  |  |  |  | 
 |  |  |  |  |  |  | 

## Setup
Rows: 13; Columns: 8

FGC EVIDENCE VALIDATION — SETUP |  |  |  |  |  |  | 
Complete the blue-labelled inputs before capturing evidence. |  |  |  |  |  |  | 
 |  |  |  |  |  |  | 
Input | Value |  | Evidence rules |  |  |  | 
Project / workshop | merSETA / EON Reality Evidence Validation |  | 1. Analytics must be reconciled with college records.
2. Missing evidence is “Not Verified”.
3. Lecturer assessment is individual.
4. Facilitator execution invalidates independence.
5. Attendance/certification/self-report are not capability proof.
6. Every reported finding must cite an evidence reference. |  |  |  | 
Reporting period start |  |  |  |  |  |  | 
Reporting period end |  |  |  |  |  |  | 
Workshop start |  |  |  |  |  |  | 
Workshop end |  |  |  |  |  |  | 
Venue / mode |  |  |  |  |  |  | 
Workshop Lead |  |  |  |  |  |  | 
Evidence Lead |  |  |  |  |  |  | 
Moderator |  |  |  |  |  |  | 

## Learner Usage
Rows: 104; Columns: 13

LEARNER UTILISATION EVIDENCE REGISTER |  |  |  |  |  |  |  |  |  |  |  | 
One row per verified college/programme/cohort/use event or aggregated platform record. |  |  |  |  |  |  |  |  |  |  |  | 
 |  |  |  |  |  |  |  |  |  |  |  | 
Record ID | College | Campus | Programme | Subject / Cohort | Use Date | Start Time | End Time | Use Context | Active Learners | Enrolled Learners | Evidence Status | Evidence Reference
=IF(B5="","","LU-"&TEXT(ROW()-4,"000")) |  |  |  |  |  |  |  |  |  |  |  | 
=IF(B6="","","LU-"&TEXT(ROW()-4,"000")) |  |  |  |  |  |  |  |  |  |  |  | 
=IF(B7="","","LU-"&TEXT(ROW()-4,"000")) |  |  |  |  |  |  |  |  |  |  |  | 
=IF(B8="","","LU-"&TEXT(ROW()-4,"000")) |  |  |  |  |  |  |  |  |  |  |  | 
=IF(B9="","","LU-"&TEXT(ROW()-4,"000")) |  |  |  |  |  |  |  |  |  |  |  | 
=IF(B10="","","LU-"&TEXT(ROW()-4,"000")) |  |  |  |  |  |  |  |  |  |  |  | 
=IF(B11="","","LU-"&TEXT(ROW()-4,"000")) |  |  |  |  |  |  |  |  |  |  |  | 
=IF(B12="","","LU-"&TEXT(ROW()-4,"000")) |  |  |  |  |  |  |  |  |  |  |  | 
=IF(B13="","","LU-"&TEXT(ROW()-4,"000")) |  |  |  |  |  |  |  |  |  |  |  | 
=IF(B14="","","LU-"&TEXT(ROW()-4,"000")) |  |  |  |  |  |  |  |  |  |  |  | 
=IF(B15="","","LU-"&TEXT(ROW()-4,"000")) |  |  |  |  |  |  |  |  |  |  |  | 
=IF(B16="","","LU-"&TEXT(ROW()-4,"000")) |  |  |  |  |  |  |  |  |  |  |  | 
=IF(B17="","","LU-"&TEXT(ROW()-4,"000")) |  |  |  |  |  |  |  |  |  |  |  | 
=IF(B18="","","LU-"&TEXT(ROW()-4,"000")) |  |  |  |  |  |  |  |  |  |  |  | 
=IF(B19="","","LU-"&TEXT(ROW()-4,"000")) |  |  |  |  |  |  |  |  |  |  |  | 
=IF(B20="","","LU-"&TEXT(ROW()-4,"000")) |  |  |  |  |  |  |  |  |  |  |  | 
=IF(B21="","","LU-"&TEXT(ROW()-4,"000")) |  |  |  |  |  |  |  |  |  |  |  | 
=IF(B22="","","LU-"&TEXT(ROW()-4,"000")) |  |  |  |  |  |  |  |  |  |  |  | 
=IF(B23="","","LU-"&TEXT(ROW()-4,"000")) |  |  |  |  |  |  |  |  |  |  |  | 
=IF(B24="","","LU-"&TEXT(ROW()-4,"000")) |  |  |  |  |  |  |  |  |  |  |  | 

## Lecturer Assessment
Rows: 104; Columns: 18

LECTURER CAPABILITY ASSESSMENT |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  | 
Scores: 2 independent; 1 prompting/limited assistance; 0 not demonstrated. Classification is formula-driven. |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  | 
 |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  | 
Assessment ID | College | Campus | Lecturer | Programme / Subject | Assessment Date | Experience Title | EON ID / URL | Curriculum | Creation | Organisation | Publish / Assign | Teaching Use | Analytics | Troubleshooting | Facilitator Executed? | Total /14 | Capability Classification
=IF(D5="","","LA-"&TEXT(ROW()-4,"000")) |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  | =IF(COUNT(I5:O5)=0,"",SUM(I5:O5)) | =IF(D5="","Not Assessed",IF(P5="Yes","Not Yet Demonstrated",IF(MIN(I5:O5)=2,"Independent",IF(Q5>=8,"Partially Independent / Support Required","Not Yet Demonstrated"))))
=IF(D6="","","LA-"&TEXT(ROW()-4,"000")) |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  | =IF(COUNT(I6:O6)=0,"",SUM(I6:O6)) | =IF(D6="","Not Assessed",IF(P6="Yes","Not Yet Demonstrated",IF(MIN(I6:O6)=2,"Independent",IF(Q6>=8,"Partially Independent / Support Required","Not Yet Demonstrated"))))
=IF(D7="","","LA-"&TEXT(ROW()-4,"000")) |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  | =IF(COUNT(I7:O7)=0,"",SUM(I7:O7)) | =IF(D7="","Not Assessed",IF(P7="Yes","Not Yet Demonstrated",IF(MIN(I7:O7)=2,"Independent",IF(Q7>=8,"Partially Independent / Support Required","Not Yet Demonstrated"))))
=IF(D8="","","LA-"&TEXT(ROW()-4,"000")) |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  | =IF(COUNT(I8:O8)=0,"",SUM(I8:O8)) | =IF(D8="","Not Assessed",IF(P8="Yes","Not Yet Demonstrated",IF(MIN(I8:O8)=2,"Independent",IF(Q8>=8,"Partially Independent / Support Required","Not Yet Demonstrated"))))
=IF(D9="","","LA-"&TEXT(ROW()-4,"000")) |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  | =IF(COUNT(I9:O9)=0,"",SUM(I9:O9)) | =IF(D9="","Not Assessed",IF(P9="Yes","Not Yet Demonstrated",IF(MIN(I9:O9)=2,"Independent",IF(Q9>=8,"Partially Independent / Support Required","Not Yet Demonstrated"))))
=IF(D10="","","LA-"&TEXT(ROW()-4,"000")) |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  | =IF(COUNT(I10:O10)=0,"",SUM(I10:O10)) | =IF(D10="","Not Assessed",IF(P10="Yes","Not Yet Demonstrated",IF(MIN(I10:O10)=2,"Independent",IF(Q10>=8,"Partially Independent / Support Required","Not Yet Demonstrated"))))
=IF(D11="","","LA-"&TEXT(ROW()-4,"000")) |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  | =IF(COUNT(I11:O11)=0,"",SUM(I11:O11)) | =IF(D11="","Not Assessed",IF(P11="Yes","Not Yet Demonstrated",IF(MIN(I11:O11)=2,"Independent",IF(Q11>=8,"Partially Independent / Support Required","Not Yet Demonstrated"))))
=IF(D12="","","LA-"&TEXT(ROW()-4,"000")) |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  | =IF(COUNT(I12:O12)=0,"",SUM(I12:O12)) | =IF(D12="","Not Assessed",IF(P12="Yes","Not Yet Demonstrated",IF(MIN(I12:O12)=2,"Independent",IF(Q12>=8,"Partially Independent / Support Required","Not Yet Demonstrated"))))
=IF(D13="","","LA-"&TEXT(ROW()-4,"000")) |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  | =IF(COUNT(I13:O13)=0,"",SUM(I13:O13)) | =IF(D13="","Not Assessed",IF(P13="Yes","Not Yet Demonstrated",IF(MIN(I13:O13)=2,"Independent",IF(Q13>=8,"Partially Independent / Support Required","Not Yet Demonstrated"))))
=IF(D14="","","LA-"&TEXT(ROW()-4,"000")) |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  | =IF(COUNT(I14:O14)=0,"",SUM(I14:O14)) | =IF(D14="","Not Assessed",IF(P14="Yes","Not Yet Demonstrated",IF(MIN(I14:O14)=2,"Independent",IF(Q14>=8,"Partially Independent / Support Required","Not Yet Demonstrated"))))
=IF(D15="","","LA-"&TEXT(ROW()-4,"000")) |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  | =IF(COUNT(I15:O15)=0,"",SUM(I15:O15)) | =IF(D15="","Not Assessed",IF(P15="Yes","Not Yet Demonstrated",IF(MIN(I15:O15)=2,"Independent",IF(Q15>=8,"Partially Independent / Support Required","Not Yet Demonstrated"))))
=IF(D16="","","LA-"&TEXT(ROW()-4,"000")) |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  | =IF(COUNT(I16:O16)=0,"",SUM(I16:O16)) | =IF(D16="","Not Assessed",IF(P16="Yes","Not Yet Demonstrated",IF(MIN(I16:O16)=2,"Independent",IF(Q16>=8,"Partially Independent / Support Required","Not Yet Demonstrated"))))
=IF(D17="","","LA-"&TEXT(ROW()-4,"000")) |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  | =IF(COUNT(I17:O17)=0,"",SUM(I17:O17)) | =IF(D17="","Not Assessed",IF(P17="Yes","Not Yet Demonstrated",IF(MIN(I17:O17)=2,"Independent",IF(Q17>=8,"Partially Independent / Support Required","Not Yet Demonstrated"))))
=IF(D18="","","LA-"&TEXT(ROW()-4,"000")) |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  | =IF(COUNT(I18:O18)=0,"",SUM(I18:O18)) | =IF(D18="","Not Assessed",IF(P18="Yes","Not Yet Demonstrated",IF(MIN(I18:O18)=2,"Independent",IF(Q18>=8,"Partially Independent / Support Required","Not Yet Demonstrated"))))
=IF(D19="","","LA-"&TEXT(ROW()-4,"000")) |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  | =IF(COUNT(I19:O19)=0,"",SUM(I19:O19)) | =IF(D19="","Not Assessed",IF(P19="Yes","Not Yet Demonstrated",IF(MIN(I19:O19)=2,"Independent",IF(Q19>=8,"Partially Independent / Support Required","Not Yet Demonstrated"))))
=IF(D20="","","LA-"&TEXT(ROW()-4,"000")) |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  | =IF(COUNT(I20:O20)=0,"",SUM(I20:O20)) | =IF(D20="","Not Assessed",IF(P20="Yes","Not Yet Demonstrated",IF(MIN(I20:O20)=2,"Independent",IF(Q20>=8,"Partially Independent / Support Required","Not Yet Demonstrated"))))
=IF(D21="","","LA-"&TEXT(ROW()-4,"000")) |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  | =IF(COUNT(I21:O21)=0,"",SUM(I21:O21)) | =IF(D21="","Not Assessed",IF(P21="Yes","Not Yet Demonstrated",IF(MIN(I21:O21)=2,"Independent",IF(Q21>=8,"Partially Independent / Support Required","Not Yet Demonstrated"))))
=IF(D22="","","LA-"&TEXT(ROW()-4,"000")) |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  | =IF(COUNT(I22:O22)=0,"",SUM(I22:O22)) | =IF(D22="","Not Assessed",IF(P22="Yes","Not Yet Demonstrated",IF(MIN(I22:O22)=2,"Independent",IF(Q22>=8,"Partially Independent / Support Required","Not Yet Demonstrated"))))
=IF(D23="","","LA-"&TEXT(ROW()-4,"000")) |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  | =IF(COUNT(I23:O23)=0,"",SUM(I23:O23)) | =IF(D23="","Not Assessed",IF(P23="Yes","Not Yet Demonstrated",IF(MIN(I23:O23)=2,"Independent",IF(Q23>=8,"Partially Independent / Support Required","Not Yet Demonstrated"))))
=IF(D24="","","LA-"&TEXT(ROW()-4,"000")) |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  | =IF(COUNT(I24:O24)=0,"",SUM(I24:O24)) | =IF(D24="","Not Assessed",IF(P24="Yes","Not Yet Demonstrated",IF(MIN(I24:O24)=2,"Independent",IF(Q24>=8,"Partially Independent / Support Required","Not Yet Demonstrated"))))

## Experience Register
Rows: 104; Columns: 10

PUBLISHED EXPERIENCE REGISTER |  |  |  |  |  |  |  |  | 
Link every capability decision to a retrievable EON output. |  |  |  |  |  |  |  |  | 
 |  |  |  |  |  |  |  |  | 
Experience ID | College | Lecturer | Programme / Subject | Experience Title | EON ID / URL | Created Date | Published Date | Assigned Cohort | Evidence Reference
=IF(E5="","","EXP-"&TEXT(ROW()-4,"000")) |  |  |  |  |  |  |  |  | 
=IF(E6="","","EXP-"&TEXT(ROW()-4,"000")) |  |  |  |  |  |  |  |  | 
=IF(E7="","","EXP-"&TEXT(ROW()-4,"000")) |  |  |  |  |  |  |  |  | 
=IF(E8="","","EXP-"&TEXT(ROW()-4,"000")) |  |  |  |  |  |  |  |  | 
=IF(E9="","","EXP-"&TEXT(ROW()-4,"000")) |  |  |  |  |  |  |  |  | 
=IF(E10="","","EXP-"&TEXT(ROW()-4,"000")) |  |  |  |  |  |  |  |  | 
=IF(E11="","","EXP-"&TEXT(ROW()-4,"000")) |  |  |  |  |  |  |  |  | 
=IF(E12="","","EXP-"&TEXT(ROW()-4,"000")) |  |  |  |  |  |  |  |  | 
=IF(E13="","","EXP-"&TEXT(ROW()-4,"000")) |  |  |  |  |  |  |  |  | 
=IF(E14="","","EXP-"&TEXT(ROW()-4,"000")) |  |  |  |  |  |  |  |  | 
=IF(E15="","","EXP-"&TEXT(ROW()-4,"000")) |  |  |  |  |  |  |  |  | 
=IF(E16="","","EXP-"&TEXT(ROW()-4,"000")) |  |  |  |  |  |  |  |  | 
=IF(E17="","","EXP-"&TEXT(ROW()-4,"000")) |  |  |  |  |  |  |  |  | 
=IF(E18="","","EXP-"&TEXT(ROW()-4,"000")) |  |  |  |  |  |  |  |  | 
=IF(E19="","","EXP-"&TEXT(ROW()-4,"000")) |  |  |  |  |  |  |  |  | 
=IF(E20="","","EXP-"&TEXT(ROW()-4,"000")) |  |  |  |  |  |  |  |  | 
=IF(E21="","","EXP-"&TEXT(ROW()-4,"000")) |  |  |  |  |  |  |  |  | 
=IF(E22="","","EXP-"&TEXT(ROW()-4,"000")) |  |  |  |  |  |  |  |  | 
=IF(E23="","","EXP-"&TEXT(ROW()-4,"000")) |  |  |  |  |  |  |  |  | 
=IF(E24="","","EXP-"&TEXT(ROW()-4,"000")) |  |  |  |  |  |  |  |  | 

## Actions
Rows: 104; Columns: 12

BARRIER, RISK & CORRECTIVE-ACTION REGISTER |  |  |  |  |  |  |  |  |  |  | 
Track utilisation and capability gaps through closure. |  |  |  |  |  |  |  |  |  |  | 
 |  |  |  |  |  |  |  |  |  |  | 
Action ID | College | Issue / Risk | Category | Evidence / Root Cause | Corrective Action | Owner | Priority | Open Date | Due Date | Status | Closure Evidence
=IF(C5="","","ACT-"&TEXT(ROW()-4,"000")) |  |  |  |  |  |  |  |  |  |  | 
=IF(C6="","","ACT-"&TEXT(ROW()-4,"000")) |  |  |  |  |  |  |  |  |  |  | 
=IF(C7="","","ACT-"&TEXT(ROW()-4,"000")) |  |  |  |  |  |  |  |  |  |  | 
=IF(C8="","","ACT-"&TEXT(ROW()-4,"000")) |  |  |  |  |  |  |  |  |  |  | 
=IF(C9="","","ACT-"&TEXT(ROW()-4,"000")) |  |  |  |  |  |  |  |  |  |  | 
=IF(C10="","","ACT-"&TEXT(ROW()-4,"000")) |  |  |  |  |  |  |  |  |  |  | 
=IF(C11="","","ACT-"&TEXT(ROW()-4,"000")) |  |  |  |  |  |  |  |  |  |  | 
=IF(C12="","","ACT-"&TEXT(ROW()-4,"000")) |  |  |  |  |  |  |  |  |  |  | 
=IF(C13="","","ACT-"&TEXT(ROW()-4,"000")) |  |  |  |  |  |  |  |  |  |  | 
=IF(C14="","","ACT-"&TEXT(ROW()-4,"000")) |  |  |  |  |  |  |  |  |  |  | 
=IF(C15="","","ACT-"&TEXT(ROW()-4,"000")) |  |  |  |  |  |  |  |  |  |  | 
=IF(C16="","","ACT-"&TEXT(ROW()-4,"000")) |  |  |  |  |  |  |  |  |  |  | 
=IF(C17="","","ACT-"&TEXT(ROW()-4,"000")) |  |  |  |  |  |  |  |  |  |  | 
=IF(C18="","","ACT-"&TEXT(ROW()-4,"000")) |  |  |  |  |  |  |  |  |  |  | 
=IF(C19="","","ACT-"&TEXT(ROW()-4,"000")) |  |  |  |  |  |  |  |  |  |  | 
=IF(C20="","","ACT-"&TEXT(ROW()-4,"000")) |  |  |  |  |  |  |  |  |  |  | 
=IF(C21="","","ACT-"&TEXT(ROW()-4,"000")) |  |  |  |  |  |  |  |  |  |  | 
=IF(C22="","","ACT-"&TEXT(ROW()-4,"000")) |  |  |  |  |  |  |  |  |  |  | 
=IF(C23="","","ACT-"&TEXT(ROW()-4,"000")) |  |  |  |  |  |  |  |  |  |  | 
=IF(C24="","","ACT-"&TEXT(ROW()-4,"000")) |  |  |  |  |  |  |  |  |  |  | 

## Evidence Index
Rows: 154; Columns: 10

EVIDENCE INDEX |  |  |  |  |  |  |  |  | 
Every finding should point to one or more indexed files, exports or signed records. |  |  |  |  |  |  |  |  | 
 |  |  |  |  |  |  |  |  | 
Evidence ID | FGC Question | College | Evidence Type | Document / Export Name | Date | Owner | Location / Link | Quality Status | Reviewer Notes
=IF(E5="","","EVD-"&TEXT(ROW()-4,"000")) |  |  |  |  |  |  |  |  | 
=IF(E6="","","EVD-"&TEXT(ROW()-4,"000")) |  |  |  |  |  |  |  |  | 
=IF(E7="","","EVD-"&TEXT(ROW()-4,"000")) |  |  |  |  |  |  |  |  | 
=IF(E8="","","EVD-"&TEXT(ROW()-4,"000")) |  |  |  |  |  |  |  |  | 
=IF(E9="","","EVD-"&TEXT(ROW()-4,"000")) |  |  |  |  |  |  |  |  | 
=IF(E10="","","EVD-"&TEXT(ROW()-4,"000")) |  |  |  |  |  |  |  |  | 
=IF(E11="","","EVD-"&TEXT(ROW()-4,"000")) |  |  |  |  |  |  |  |  | 
=IF(E12="","","EVD-"&TEXT(ROW()-4,"000")) |  |  |  |  |  |  |  |  | 
=IF(E13="","","EVD-"&TEXT(ROW()-4,"000")) |  |  |  |  |  |  |  |  | 
=IF(E14="","","EVD-"&TEXT(ROW()-4,"000")) |  |  |  |  |  |  |  |  | 
=IF(E15="","","EVD-"&TEXT(ROW()-4,"000")) |  |  |  |  |  |  |  |  | 
=IF(E16="","","EVD-"&TEXT(ROW()-4,"000")) |  |  |  |  |  |  |  |  | 
=IF(E17="","","EVD-"&TEXT(ROW()-4,"000")) |  |  |  |  |  |  |  |  | 
=IF(E18="","","EVD-"&TEXT(ROW()-4,"000")) |  |  |  |  |  |  |  |  | 
=IF(E19="","","EVD-"&TEXT(ROW()-4,"000")) |  |  |  |  |  |  |  |  | 
=IF(E20="","","EVD-"&TEXT(ROW()-4,"000")) |  |  |  |  |  |  |  |  | 
=IF(E21="","","EVD-"&TEXT(ROW()-4,"000")) |  |  |  |  |  |  |  |  | 
=IF(E22="","","EVD-"&TEXT(ROW()-4,"000")) |  |  |  |  |  |  |  |  | 
=IF(E23="","","EVD-"&TEXT(ROW()-4,"000")) |  |  |  |  |  |  |  |  | 
=IF(E24="","","EVD-"&TEXT(ROW()-4,"000")) |  |  |  |  |  |  |  |  | 

## Lists
Rows: 10; Columns: 8

Evidence Status | Use Context | Capability Class | Action Status | Action Category | Score | Yes/No | Priority
Verified | Scheduled class | Independent | Not Started | Licence | 0 | Yes | Critical
Partially Verified | Facilitated lab | Partially Independent / Support Required | In Progress | Account | 1 | No | High
Not Verified | Independent study | Not Yet Demonstrated | Complete | Device | 2 |  | Medium
Contradicted | Project/assignment | Not Assessed | Overdue | Connectivity |  |  | Low
 | Assessment |  |  | Timetable |  |  | 
 | After-hours |  |  | Content |  |  | 
 | No meaningful use |  |  | Capability |  |  | 
 |  |  |  | Support |  |  | 
 |  |  |  | Governance |  |  | 