import { IConsumerUsageCommand } from "../../models/mam/IConsumerUsageCommand";
import { IConsumerManagerState } from "../../models/state/IConsumerManagerState";
import { IConsumerConfiguration } from "../config/consumer/IConsumerConfiguration";
import { IConsumerPaymentRequestCommand } from "../mam/IConsumerPaymentRequestCommand";

/**
 * Interface definition for consumer strategy for calculating usage.
 */
export interface IConsumerStrategy<S> {
    /**
     * Initialise the state.
     */
    initState(): Promise<S>;

    /**
     * Gets the usage values.
     * @param config The config of the consumer
     * @param consumerState The state for the manager calling the strategy
     * @returns List of usage commands.
     */
    usage(config: IConsumerConfiguration, consumerState: IConsumerManagerState<S>):
        Promise<{
            /**
             * Has the state been updated.
             */
            updatedState: boolean;
            /**
             * New commands to output.
             */
            commands: IConsumerUsageCommand[];
        }>;

    /**
     * Processes payment requests.
     * @param config The configuration of the consumer
     * @param consumerState The state for the manager calling the strategy
     * @param paymentRequests Payment requests to process.
     */
    paymentRequests(
        config: IConsumerConfiguration,
        consumerState: IConsumerManagerState<S>,
        paymentRequests: IConsumerPaymentRequestCommand[]):
        Promise<{
            /**
             * Has the state been updated.
             */
            updatedState: boolean;
        }>;
}
