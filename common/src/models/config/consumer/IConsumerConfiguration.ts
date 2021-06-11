/**
 * Definition of consumer configuration file.
 */
export interface IConsumerConfiguration {
    /**
     * The id of the consumer.
     */
    id: string;

    /**
     * The name of the consumer.
     */
    name: string;

    /**
     * Extended properties for the source.
     */
    extendedProperties?: { [id: string]: any };
}
