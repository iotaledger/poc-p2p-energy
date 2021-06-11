/**
 * Interface definition for logging service;
 */
export interface ILoggingService {
    /**
     * Log the message.
     * @param context The context for the log.
     * @param message The message to log.
     * @param params The parameters to log.
     */
    log(context: string, message: string, ...params: any): void;

    /**
     * Log a break.
     */
    break(): void;

    /**
     * Log the error.
     * @param context The context for the log.
     * @param message The message to log.
     * @param err The error to log.
     * @param params The parameters to log.
     */
    error(context: string, message: string, err: Error, ...params: any): void;
}
