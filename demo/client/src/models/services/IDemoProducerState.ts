import { IProducerOutputCommand } from "p2p-energy-common/dist/models/mam/IProducerOutputCommand";
import { IProducerManagerState } from "p2p-energy-common/dist/models/state/IProducerManagerState";
import { IBasicProducerStrategyState } from "p2p-energy-common/dist/models/strategies/IBasicProducerStrategyState";

export interface IDemoProducerState {
    /**
     * The producer manager state.
     */
    producerManagerState?: IProducerManagerState<IBasicProducerStrategyState>;

    /**
     * The output commands from the producer.
     */
    outputCommands: IProducerOutputCommand[];
}
