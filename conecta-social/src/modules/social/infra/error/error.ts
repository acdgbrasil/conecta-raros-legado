/**
 * Represents a custom error with additional properties.
 */
export class CustomError extends Error {
  /**
   * The title of the error.
   */
  erroTitle: string;
  /**
   * The status code associated with the error.
   */
  statusCode: number;
  /**
   * The name of the error.
   */
  name: string;
  /**
   * The error message.
   */
  message: string;
  
  /**
   * Creates a new instance of the CustomError class.
   * @param errorType - The type of the error.
   * @param statusCode - The status code associated with the error.
   * @param name - The name of the error.
   * @param message - The error message.
   */
  constructor(errorType: string, statusCode: number, name: string, message: string) {
    super(message);
    this.erroTitle = errorType;
    this.statusCode = statusCode;
    this.name = name;
    this.message = message;
  }

  /**
   * Converts the error to a JSON object.
   * @param message - The custom error message.
   * @returns The error as a JSON object.
   */
  toJson(message: string) {
    return {
      erroTitle: this.erroTitle,
      statusCode: this.statusCode,
      name: this.name,
      message: message
    };
  }
}