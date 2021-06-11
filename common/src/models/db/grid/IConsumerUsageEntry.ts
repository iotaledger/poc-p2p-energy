/**
 * Object definition for storing usage from a consumer.
 */
export interface IConsumerUsageEntry {
    /**
     * The startTime for the consumers usage.
     */
    startTime: number;

    /**
     * The endTime for the consumers usage.
     */
    endTime: number;

    /**
     * The usage for the consumer in kWh.
     */
    usage: number;
}
