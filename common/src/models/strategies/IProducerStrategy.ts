import { IProducerConfiguration } from "../config/producer/IProducerConfiguration";
import { ISourceStoreOutput } from "../db/producer/ISourceStoreOutput";
import { IProducerOutputCommand } from "../mam/IProducerOutputCommand";
import { IProducerManagerState } from "../state/IProducerManagerState";

/**
 * Interface definition for producer strategy for calculating outputs and payments
 */
export interface IProducerStrategy<S> {
    /**
     * Initialise the state.
     */
    initState(): Promise<S>;

    /**
     * Collated sources output.
     * @param config The config of the producer.
     * @param sourceOutputById The unread output from the sources.
     * @param producerState The current state of the producer.
     * @returns The list of commands for the producer to output.
     */
    sources(
        config: IProducerConfiguration,
        sourceOutputById: { [id: string]: ISourceStoreOutput[] },
        producerState: IProducerManagerState<S>):
        Promise<{
            /**
             * Has the state been updated.
             */
            updatedState: boolean;
            /**
             * New commands to output.
             */
            commands: IProducerOutputCommand[];
        }>;

    /**
     * Collated payments.
     * @param config The config of the producer.
     * @param producerState The current state of the producer.
     */
    payments(
        config: IProducerConfiguration,
        producerState: IProducerManagerState<S>):
        Promise<{
            /**
             * Has the state been updated.
             */
            updatedState: boolean;
        }>;
}
