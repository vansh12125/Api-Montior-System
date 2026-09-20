interface ErrorResponse {
  success: false;
  message: string;
  error: unknown;
  statusCode: number;
  timestamp: string;
}

interface SuccessResponse {
  success: true;
  message: string;
  data: unknown;
  statusCode: number;
  timestamp: string;
}

/**
 * ResponseFormatter - Utility class for formatting API responses in a consistent structure.
 * This class can be extended in the future to include additional response types or features as needed.
 */

class ResponseFormatter {
  /**
   * Formats a successful response with optional data and message.
   * @param {unknown} data - The data to include in the response (default: null)
   * @param {string} message - The message to include in the response (default: "Success")
   * @param {number} statusCode - The HTTP status code for the response (default: 200)
   * @returns {SuccessResponse} - The formatted response object
   */
  static success(
    statusCode: number = 200,
    message: string = "success",
    data: unknown = null,
  ): SuccessResponse {
    return {
      success: true,
      message,
      data,
      statusCode,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Creates a standardized error response object.
   *
   * @param {number} statusCode - HTTP status code for the error response.
   * @param {string} message - Error message to include in the response.
   * @param {unknown} error - Optional additional error details.
   * @returns {ErrorResponse} Standardized error response object.
   */
  static error(
    statusCode: number = 500,
    message: string = "Error",
    error: unknown = null,
  ): ErrorResponse {
    return {
      success: false,
      message,
      error,
      statusCode,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Creates a standardized validation error response object.
   * @param {unknown} error - validation error details.
   * @returns {ErrorResponse} Standardized error response object.
   */
  static validationError(error: unknown = null): ErrorResponse {
    return {
      success: false,
      statusCode: 400,
      message: "Validation failed",
      error,
      timestamp: new Date().toISOString(),
    };
  }
}

export { ResponseFormatter };
