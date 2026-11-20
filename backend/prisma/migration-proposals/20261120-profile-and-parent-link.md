# Migration proposal: persisted student, staff, parent-link, and OTP data

Proposal only. No migration was generated or applied, and no database was accessed.

Generate and review a migration from the current `backend/prisma/schema.prisma` using the repository's normal Prisma workflow. The proposal must account for these exact schema changes:

## StudentProfile

- Add nullable `gender`, `medium`, `district`, and `stream` string columns.
- No new unique constraint or index is declared for these fields.

## TeacherProfile

- Add non-null `staffStatus` string with default `"active"` so existing rows receive the schema default.
- No new index is declared for this field.

## ParentChildLinkRequest

- Add `id` UUID primary key, `parentId`, `studentId`, unique `tokenHash`, `expiresAt`, `attempts` defaulting to `0`, nullable `consumedAt`, and `createdAt` defaulting to now.
- Add `parent` relation to `ParentProfile.id` with `onDelete: Cascade` and `student` relation to `StudentProfile.id` with `onDelete: Cascade`.
- Add only these non-unique indexes: `(parentId, expiresAt)` and `(studentId, expiresAt)`.
- The only additional unique constraint is the unique `tokenHash` field; there is no unique parent/student pair constraint.
- Add the corresponding `linkRequests` back-relations to `ParentProfile` and `StudentProfile`.

## OtpChallenge

- Add `id` UUID primary key, `email`, `purpose`, non-unique `tokenHash`, `expiresAt`, `attempts` defaulting to `0`, nullable `consumedAt`, and `createdAt` defaulting to now.
- This model has no foreign-key relations.
- Add only these non-unique indexes: `(email, purpose, createdAt)` and `(expiresAt, consumedAt)`.

Before approval, verify the generated migration against the schema and the existing migration history, review default/backfill behavior and cascade effects, and test against a disposable database snapshot. Apply only through the reviewed deployment process after approval. Do not delete or rewrite prior migration history.
