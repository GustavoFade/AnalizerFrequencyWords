export class ApplicationError extends Error {
  constructor(message: string, readonly code: string) {
    super(message);
    this.name = 'ApplicationError';
  }
}

export class InvalidBookInputError extends ApplicationError {
  constructor(message: string) { super(message, 'INVALID_BOOK_INPUT'); }
}

export class DuplicateBookError extends ApplicationError {
  constructor() { super('Book was already imported', 'DUPLICATE_BOOK'); }
}

export class EmptyBookError extends ApplicationError {
  constructor() { super('Book contains no readable text', 'EMPTY_BOOK'); }
}
