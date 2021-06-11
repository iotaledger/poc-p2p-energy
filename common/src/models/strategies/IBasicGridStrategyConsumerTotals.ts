/**
 * Definition of grid stratey state.
 */
export interface IBasicGridStrategyConsumerTotals {
    /**
     * Total usage for the consumer.
     */
    usage: number;

    /**
     * Total usage requested from the consumer.
     */
    requestedUsage: number;

    /**
     * Total paid by the consumer.
     */
    paid: number;

    /**
     * Total outstanding by the consumer.
     */
    outstanding: number;
}
