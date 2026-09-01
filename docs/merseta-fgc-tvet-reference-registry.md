# FGC National TVET Reference Registry

The FGC platform now has a dedicated reference-data layer for TVET institutions, campuses, academic structures and controlled capture options. This is separate from evidence records: the registry tells the app what can be selected, while FGC evidence tables record what was actually observed, verified or contradicted.

## Migration Files

Run after the original FGC evidence schema:

```bash
psql "$DATABASE_URL" -f db/fgc/003_tvet_reference_schema.sql
psql "$DATABASE_URL" -f db/fgc/004_seed_tvet_reference.sql
```

## What Is Seeded

- 9 South African provinces.
- 50 public TVET colleges.
- A conservative campus subset for Sedibeng TVET College and Buffalo City TVET College.
- Programme categories for NC(V), Report 191/NATED Engineering, Report 191/NATED Business, Report 191/NATED Services, occupational qualifications, occupational part-qualifications, occupational skills programmes, learnership-linked pathways, apprenticeships/trades, PLP, Level 5, Level 6, other approved TVET and historical/teach-out pathways.
- NC(V) programme catalogue entries and broad Report 191 groupings.
- A limited subject/module subset used by the current capture prototype.
- Evidence type, facility type, readiness and other controlled option sets.

## What Is Not Seeded

Campus-level programme offerings are intentionally empty until verified source data is imported. A national programme existing in the catalogue does not prove that a selected campus offers it in a selected year or level.

The data-capture UI therefore allows a staged programme selection from the national catalogue and warns the user when no verified campus offering exists.

## Import Design

The registry includes:

- `fgc.reference_import_batches` for import metadata, source document tracking and approval state.
- `fgc.reference_import_staging_rows` for row-level validation messages before upsert.
- `fgc.reference_sources` for source provenance.
- `fgc.reference_audit_events` for controlled changes.

Recommended import order:

1. Provinces, municipalities and college master records.
2. Campus master records.
3. Programme categories, levels, qualifications and curriculum versions.
4. Subject/module mappings.
5. College programme offerings.
6. Campus programme offerings by year, mode and level.
7. Lecturer profiles and teaching assignments.

## Frontend Bridge

Until the PostgreSQL API is connected, the app mirrors a subset of reference data in `src/content/fgc-reference-data.ts` and exposes it through `src/services/fgc-reference.ts`.

The capture portal now uses cascading selections:

- Province filters TVET colleges.
- TVET college filters campuses.
- Programme category filters programmes.
- Programme filters levels.
- Programme and level filter subjects/modules.

When PostgreSQL is connected, replace the mock reference service with API calls that read from the same table boundaries.

## Curriculum Master Architecture Change

The National TVET Curriculum Master Catalogue is now its own model in `db/fgc/005_curriculum_master_schema.sql`. It is not a child of a campus and it must not be filtered by campus offerings.

The three independent datasets are:

- National Curriculum Catalogue: programmes, qualifications, levels, subjects, modules, trades, aliases, source provenance and curriculum versions.
- Institutional Structure: province, college and campus.
- Campus Programme Intelligence: verified or unverified campus offering relationships used for analytics and administrator review.

Lecturers select their institution first, then select a programme/level/subject from the national catalogue. If the campus relationship has not been verified, the UI may show a soft note, but selection remains allowed.

The app also has a protected `Curriculum Catalogue` tab in the FGC workspace for administrators to review category coverage, source status, search results and data-quality gaps.

## Import Gap Register

The current implementation provides the schema, import staging, source provenance, aliases and starter data. The following authoritative imports are still required before anyone can claim catalogue completeness:

- DHET NC(V) Subject Matrix and all programme-level-subject relationships.
- DHET Report 191 Part 1 and Part 2 programme/subject relationships.
- Revised Report 191 syllabi where current.
- QCTO occupational qualifications, part-qualifications and occupational skills programmes.
- SAQA qualification IDs, NQF levels, credits and registration status.
- Official trades/apprenticeship lists and trade-test requirements.
- PLP curriculum/assessment components.
