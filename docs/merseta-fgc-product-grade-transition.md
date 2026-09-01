# FGC Product-Grade Transition

The FGC App has moved from a read-only prototype into a functioning frontend product shell. It is still intentionally frontend-first, but product actions now mutate a durable workspace state and can be exported for review.

## Implemented Product Behaviors

- Protected sign-in remains role-aware through the existing demo access model.
- The app hydrates a workspace from local storage when one exists.
- Capture wizard values persist as a draft across steps.
- Valid sign-off creates:
  - evidence item
  - learner-use record
  - lecturer assessment
  - optional corrective action
  - optional curriculum reference request
  - audit event
- Corrective action status can be updated from the app.
- Workspace state is persisted locally after changes.
- Workspace state can be exported as JSON.
- Demo state can be reset to the original mock source records.
- The Curriculum Catalogue tab shows catalogue quality, search, pending reference requests and audit events.

## Still Frontend-Only

The current storage layer is local browser storage. This is suitable for product interaction validation, not production evidence governance.

Before production, replace local persistence with:

- authenticated API routes or backend service endpoints
- PostgreSQL persistence using the `db/fgc` schema
- server-side authorisation for every role and institution scope
- immutable audit logging
- object storage for uploaded evidence files
- import pipelines for EON analytics, tracker workbooks and official curriculum sources

## Service Boundary

`src/services/fgc-workspace.ts` contains pure product operations:

- `hydrateWorkspace`
- `createCaptureSubmission`
- `updateActionStatus`
- `exportWorkspace`

These functions define the current behavior contract and should be mirrored by the future PostgreSQL-backed API.
