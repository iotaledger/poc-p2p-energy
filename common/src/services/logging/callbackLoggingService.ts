import { ILoggingEntry } from "../../models/services/ILoggingEntry";
import { ILoggingService } from "../../models/services/ILoggingService";

/**
 * Service to handle console logging.
 */
export class CallbackLoggingService implements ILoggingService {
    /**
     * The callback to send to.
     */
    private readonly _callbacks: {
        [id: string]: (log: ILoggingEntry) => void
    };

    /**
     * Create a new instance of CallbackLoggingService.
     */
    constructor() {
        this._callbacks = {};
    }

    /**
     * Log the message.
     * @param context The context for the log.
     * @param message The message to log.
     * @param params The parameters to log.
     */
    public log(context: string, message: string, ...params: any): void {
        this.sendLog(context, message, undefined, ...params);
    }

    /**
     * Log a break.
     */
    public break(): void {
        this.sendLog("", "", undefined, undefined);
    }

    /**
     * Log the error.
     * @param context The context for the log.
     * @param message The message to log.
     * @param err The error to log.
     * @param params The parameters to log.
     */
    public error(context: string, message: string, err: Error, ...params: any): void {
        this.sendLog(context, message, err, ...params);
    }

    /**
     * Add a new callback.
     * @param id The id of the callback.
     * @param callback The callback to call.
     */
    public addCallback(id: string, callback: (log: ILoggingEntry) => void): void {
        this._callbacks[id] = callback;
    }

    /**
     * Remove a callback by id.
     * @param id The id of the callback.
     */
    public removeCallback(id: string): void {
        delete this._callbacks[id];
    }

    /**
     * Send a log entry to the callbacks.
     * @param context The context for the log.
     * @param message The message.
     * @param err The error.
     * @param params The parameters.
     */
    private sendLog(context: string, message: string, err: Error, ...params: any): void {
        for (const id in this._callbacks) {
            this._callbacks[id]({ context, message, err, params});
        }
    }
}
