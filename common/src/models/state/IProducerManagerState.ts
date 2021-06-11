import { IMamChannelConfiguration } from "../mam/IMamChannelConfiguration";
import { IMamCommand } from "../mam/IMamCommand";

/**
 * Definition of producer state.
 */
export interface IProducerManagerState<S> {
    /**
     * The channel configuration for the producer.
     */
    channel?: IMamChannelConfiguration;

    /**
     * Commands that have not been sent.
     */
    unsentCommands: IMamCommand[];

    /**
     * The state for the strategy.
     */
    strategyState?: S;
}
