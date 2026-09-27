export default class ApiError extends Error {
  constructor(message, statusCode, error) {
    super(message);
    this.name = "AppError";
    this.statusCode = statusCode;
    this.error = error;
  }

  static badRequest(message, error) {
    return new AppError(message, 400, error);
  }

  static unauthorized(message, error) {
    return new AppError(message, 401, error);
  }

  static forbidden(message, error) {
    return new AppError(message, 403, error);
  }

  static notFound(message, error) {
    return new AppError(message, 404, error);
  }

  static conflict(message, error) {
    return new AppError(message, 409, error);
  }

  static internal(message = "Internal server error", error) {
    return new AppError(message, 500, error);
  }
}
