import { IConsumerUsageCommand } from "p2p-energy-common/dist/models/mam/IConsumerUsageCommand";
import { IConsumerManagerState } from "p2p-energy-common/dist/models/state/IConsumerManagerState";
import { IBasicConsumerStrategyState } from "p2p-energy-common/dist/models/strategies/IBasicConsumerStrategyState";

export interface IDemoConsumerState {
    /**
     * The consumer manager state.
     */
    consumerManagerState: IConsumerManagerState<IBasicConsumerStrategyState>;

    /**
     * The usage commands from the consumer.
     */
    usageCommands: IConsumerUsageCommand[];
}
