# Agent Instructions

## Repository State

- This repository is currently a blank starting point: there is no manifest, source tree, lockfile, build configuration, or test configuration yet.
- Do not assume scripts or directory boundaries exist; establish them explicitly when bootstrapping the Node.js/TypeScript project.
- Keep detailed design notes in dedicated project documentation rather than expanding this file.

## Product Requirements

- The application accepts English books in PDF or TXT, tokenizes their text, groups words by frequency, and persists the result in a local SQLite database.
- The data model must contain `books`, `words`, and a many-to-many join between them. A word is reused and linked to every book where it occurs; do not duplicate a word row per book.
- Preserve enough per-book data in the join to calculate/display frequency by book and compare words shared across books or subject areas.
- A book has a free-text subject area entered in the add-book form; the UI must support global, per-book, and per-area views.
- Persist all normalized words and total occurrences; stop-word hiding is a UI filter, not an import-time deletion.
- Re-adding the same book must be blocked as a duplicate; the exact identity key (canonical path, content hash, or both) must be decided before schema implementation.
- The Electron UI needs a scrollable, frequency-descending word list and a form for adding a book.
- Backend/domain code is Node.js with TypeScript; unit tests use Jest.
- Organize the application using layered architecture, keeping presentation, application/domain logic, and infrastructure/database responsibilities separated.
- Enforce the layer dependency direction with architecture fitness functions; architectural rules must fail verification when a forbidden import is introduced.
- Use `dependency-cruiser` for architecture fitness functions; configure it as a development dependency and make its verification script fail on forbidden imports or cycles.

## Implementation Constraints

- Normalize tokens consistently before lookup (including case handling and punctuation rules) so repeated words map to one `words` row.
- Analyze books incrementally with streams/chunks: do not load the complete book text into memory; TXT should use a readable stream and PDF should be processed page by page before emitting text chunks.
- Use database constraints and a transaction when importing a book, creating/reusing words, and inserting links; imports must not leave partial relationships.
- The user approved `pdfjs-dist` for PDF text extraction; use it only when bootstrapping the project. It does not provide OCR for scanned PDFs. TXT extraction can use Node's standard filesystem APIs unless requirements change.
- Once tooling is added, document the exact install, development, test, focused-test, typecheck, lint, and build commands here only when they are verified from the project configuration.

## Verification

- Add Jest unit coverage for token normalization, frequency aggregation, repeated-word reuse, many-to-many linking, and failed/partial imports.
- Prefer focused tests for the changed module first, then run the repository's configured checks in their documented order.

## Delivery Workflow

- Deliver work incrementally: each commit should represent one coherent change, remain buildable when practical, and avoid mixing unrelated refactors.
- Use semantic commit messages in the Conventional Commits format, such as `feat: add book tokenizer`, `fix: rollback failed imports`, `test: cover word reuse`, `docs: clarify import rules`, or `chore: configure eslint`.
- Before committing, run the focused verification for the changed area and inspect the staged diff; do not commit secrets, local databases, generated artifacts, or unrelated user changes.
