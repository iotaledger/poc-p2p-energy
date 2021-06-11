import { IConsumerUsageEntry } from "./IConsumerUsageEntry";

/**
 * Object definition for storing usage from a consumer.
 */
export interface IConsumerUsage {
    /**
     * The id of the consumer.
     */
    id: string;

    /**
     * The usage records from the consumer.
     */
    usage: IConsumerUsageEntry[];
}
