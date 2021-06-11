import { IMamChannelConfiguration } from "../mam/IMamChannelConfiguration";
import { IMamCommand } from "../mam/IMamCommand";

/**
 * Definition of consumer state.
 */
export interface IConsumerManagerState<S> {
    /**
     * The channel configuration for the consumer.
     */
    channel?: IMamChannelConfiguration;

    /**
     * The return channel configuration from the grid.
     */
    returnChannel?: IMamChannelConfiguration;

    /**
     * Commands that have not been sent.
     */
    unsentCommands: IMamCommand[];

    /**
     * The state for the strategy.
     */
    strategyState?: S;
}
