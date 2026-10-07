export default class ApiError extends Error {
  constructor(message, statusCode, error) {
    super(message);

    this.name = "AppError";
    this.statusCode = statusCode;
    this.error = error;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(message, error) {
    return new ApiError(message, 400, error);
  }

  static unauthorized(message, error) {
    return new ApiError(message, 401, error);
  }

  static forbidden(message, error) {
    return new ApiError(message, 403, error);
  }

  static notFound(message, error) {
    return new ApiError(message, 404, error);
  }

  static conflict(message, error) {
    return new ApiError(message, 409, error);
  }

  static internal(message = "Internal server error", error) {
    return new ApiError(message, 500, error);
  }
}
