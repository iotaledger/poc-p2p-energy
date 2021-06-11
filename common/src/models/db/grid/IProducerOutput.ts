import { IProducerOutputEntry } from "./IProducerOutputEntry";

/**
 * Object definition for storing output from a producer.
 */
export interface IProducerOutput {
    /**
     * The id of the producers.
     */
    id: string;

    /**
     * The output records from the producer.
     */
    output: IProducerOutputEntry[];
}
