# Validation Record

## Current Evidence

- TXT fixtures cover two-book import, shared words, area filtering and frequency aggregation.
- `test/fixtures/book.pdf` is a digital PDF fixture and is extracted page by page by `PdfExtractor`.
- PDFs without a text layer fail with `PDF contains no extractable text; scanned PDFs are not supported.`
- `npm run package` generated `release/win-unpacked/frequency-words-analyzer.exe` on Windows.

## Known Limitation

Scanned PDFs are not processed because this version does not include OCR. The importer rejects them explicitly rather than persisting an empty book.
