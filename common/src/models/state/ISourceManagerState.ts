import { IMamChannelConfiguration } from "../mam/IMamChannelConfiguration";
import { IMamCommand } from "../mam/IMamCommand";

/**
 * Definition of source state.
 */
export interface ISourceManagerState<S> {
    /**
     * The channel configuration for the source.
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
