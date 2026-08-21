# Validation Record

## Current Evidence

- TXT fixtures cover two-book import, shared words, area filtering and frequency aggregation.
- `test/fixtures/book.pdf` is a digital PDF fixture and is extracted page by page by `PdfExtractor`.
- PDFs without a text layer fail with `PDF contains no extractable text; scanned PDFs are not supported.`
- `npm run package` generated `release/win-unpacked/frequency-words-analyzer.exe` on Windows.
- `npm run measure:streaming` processes 10,000 chunks (16,640,000 bytes) while retaining only the incremental analyzer state; the run reported 2 unique words and a peak heap of 6,303,432 bytes on the development machine.

## Known Limitation

Scanned PDFs are not processed because this version does not include OCR. The importer rejects them explicitly rather than persisting an empty book.
