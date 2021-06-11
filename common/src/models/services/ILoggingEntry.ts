/**
 * Interface definition for logging entry;
 */
export interface ILoggingEntry {
    /**
     * The context that was logged.
     */
    context: string;
    /**
     * The message that was logged.
     */
    message: string;
    /**
     * The error that was logged.
     */
    err?: Error;
    /**
     * The params that were logged.
     */
    params?: any[];
}
