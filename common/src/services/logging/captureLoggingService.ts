import { ILoggingEntry } from "../../models/services/ILoggingEntry";
import { ILoggingService } from "../../models/services/ILoggingService";

/**
 * Service to handle console logging.
 */
export class CaptureLoggingService implements ILoggingService {
    /**
     * The capture log.
     */
    private _log?: ILoggingEntry[];

    /**
     * Contexts to capture.
     */
    private _contexts: string[];

    /**
     * Log the message.
     * @param context The context for the log.
     * @param message The message to log.
     * @param params The parameters to log.
     */
    public log(context: string, message: string, ...params: any): void {
        if (this._log && (!this._contexts || this._contexts.indexOf(context) >= 0)) {
            this._log.push({
                context,
                message,
                params
            });
        }
    }

    /**
     * Log a break.
     */
    public break(): void {
        if (this._log) {
            this._log.push({
                context: "",
                message: ""
            });
        }
    }

    /**
     * Log the error.
     * @param context The context for the log.
     * @param message The message to log.
     * @param err The error to log.
     * @param params The parameters to log.
     */
    public error(context: string, message: string, err: Error, ...params: any): void {
        if (this._log && (!this._contexts || this._contexts.indexOf(context) >= 0)) {
            this._log.push({
                context,
                message,
                err,
                params
            });
        }
    }

    /**
     * Enable the logging for the given contexts.
     * @param contexts The context to monitor.
     */
    public enable(contexts?: string[]): void {
        this._contexts = contexts;
        this._log = [];
    }

    /**
     * Disable the logging.
     */
    public disable(): void {
        this._contexts = undefined;
        this._log = undefined;
    }

    /**
     * Get the logged items filter by context.
     * @returns The captured log entries.
     */
    public getCapture(): ILoggingEntry[] {
        const log = this._log;
        if (log) {
            this._log = [];
        }
        return log;
    }

    /**
     * Format a capture into readable text.
     * @param capture A list of logging entries to format.
     * @returns The formatted entries.
     */
    public formatCapture(capture: ILoggingEntry[]): string[] {
        const formatted = [];

        if (capture) {
            for (let i = 0; i < capture.length; i++) {
                if (capture[i].err) {
                    formatted.push(`[${capture[i].context}] Error::${capture[i].message}`);
                    formatted.push(`[${capture[i].context}] Error::${capture[i].err.message}`);
                } else {
                    if (capture[i].context === "" && capture[i].message === "") {
                        formatted.push("");
                    } else {
                        formatted.push(`[${capture[i].context}] ${capture[i].message}`);
                    }
                }
                if (capture[i].params) {
                    capture[i].params.map(p => {
                        formatted.push(p.toString());
                    });
                }
            }
        }

        return formatted;
    }
}
