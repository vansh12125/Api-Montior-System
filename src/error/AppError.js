class AppError extends Error {
  constructor(
    message = "Some Error Occured.",
    statusCode = 500,
    errors = null,
  ) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

export { AppError };
