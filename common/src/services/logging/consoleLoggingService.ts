import { ILoggingService } from "../../models/services/ILoggingService";

/**
 * Service to handle console logging.
 */
export class ConsoleLoggingService implements ILoggingService {
    /**
     * Log the message.
     * @param context The context for the log.
     * @param message The message to log.
     * @param params The parameters to log.
     */
    public log(context: string, message: string, ...params: any): void {
        // tslint:disable-next-line:no-console
        console.log(`[${context}] ${message}`, ...params);
    }

    /**
     * Log a break.
     */
    public break(): void {
        // tslint:disable-next-line:no-console
        console.log();
    }

    /**
     * Log the error.
     * @param context The context for the log.
     * @param message The message to log.
     * @param err The error to log.
     * @param params The parameters to log.
     */
    public error(context: string, message: string, err: Error, ...params: any): void {
        console.error(`[${context}] ${message}::Error`, err, ...params);
    }
}
