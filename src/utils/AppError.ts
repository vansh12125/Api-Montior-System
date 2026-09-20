class AppError extends Error {
  private statusCode: number;
  private errors: unknown;
  private isOperational: boolean;
  constructor(
    message: string = "Some Error Occured.",
    statusCode: number = 500,
    errors: unknown = null,
  ) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

export { AppError };
