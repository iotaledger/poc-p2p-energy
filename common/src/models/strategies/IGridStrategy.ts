import { IGridConfiguration } from "../config/grid/IGridConfiguration";
import { IConsumerUsageEntry } from "../db/grid/IConsumerUsageEntry";
import { IProducerOutputEntry } from "../db/grid/IProducerOutputEntry";
import { IConsumerPaymentRequestCommand } from "../mam/IConsumerPaymentRequestCommand";
import { IGridManagerState } from "../state/IGridManagerState";

/**
 * Interface definition for grid strategy for calculating outputs and payments
 */
export interface IGridStrategy<S> {
    /**
     * Initialise the state.
     */
    initState(): Promise<S>;

    /**
     * Collated consumers usage.
     * @param config The id of the grid.
     * @param consumerUsageById The unread output from the consumers.
     * @param gridState The current state of the grid.
     */
    consumers(
        config: IGridConfiguration,
        consumerUsageById: { [id: string]: IConsumerUsageEntry[] },
        gridState: IGridManagerState<S>):
        Promise<{
            /**
             * Has the state been updated.
             */
            updatedState: boolean;

            /**
             * Commands to send for each consumer.
             */
            paymentRequests: { [id: string]: IConsumerPaymentRequestCommand };
        }>;

    /**
     * Collated producer output.
     * @param config The id of the grid.
     * @param producerUsageById The unread output from the producers.
     * @param gridState The current state of the grid.
     */
    producers(
        config: IGridConfiguration,
        producerUsageById: { [id: string]: IProducerOutputEntry[] },
        gridState: IGridManagerState<S>):
        Promise<{
            /**
             * Has the state been updated.
             */
            updatedState: boolean;
        }>;

    /**
     * Collated payments.
     * @param config The id of the grid.
     * @param gridState The current state of the grid.
     */
    payments(
        config: IGridConfiguration,
        gridState: IGridManagerState<S>):
        Promise<{
            /**
             * Has the state been updated.
             */
            updatedState: boolean;
        }>;
}
