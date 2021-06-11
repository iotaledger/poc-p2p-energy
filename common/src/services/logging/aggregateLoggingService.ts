import { ILoggingService } from "../../models/services/ILoggingService";

/**
 * Service to handle multiple logging services.
 */
export class AggregateLoggingService implements ILoggingService {
    /**
     * The list of services.
     */
    private readonly _services: ILoggingService[];

    /**
     * Create a new instance of AggregateLoggingService.
     * @param services The list of services to aggregate.
     */
    constructor(services: ILoggingService[]) {
        this._services = services;
    }

    /**
     * Log the message.
     * @param context The context for the log.
     * @param message The message to log.
     * @param params The parameters to log.
     */
    public log(context: string, message: string, ...params: any): void {
        for (let i = 0; i < this._services.length; i++) {
            this._services[i].log(context, message, ...params);
        }
    }

    /**
     * Log a break.
     */
    public break(): void {
        for (let i = 0; i < this._services.length; i++) {
            this._services[i].break();
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
        for (let i = 0; i < this._services.length; i++) {
            this._services[i].error(context, message, err, ...params);
        }
    }
}
