import { IGridManagerState } from "p2p-energy-common/dist/models/state/IGridManagerState";
import { IBasicGridStrategyState } from "p2p-energy-common/dist/models/strategies/IBasicGridStrategyState";
import { IDemoConsumerState } from "./IDemoConsumerState";
import { IDemoProducerState } from "./IDemoProducerState";
import { IDemoSourceState } from "./IDemoSourceState";

export interface IDemoGridState {
    /**
     * The grid manager state.
     */
    gridManagerState?: IGridManagerState<IBasicGridStrategyState>;

    /**
     * The producer states.
     */
    producerStates: { [id: string]: IDemoProducerState };

    /**
     * The consumer states.
     */
    consumerStates: { [id: string]: IDemoConsumerState };

    /**
     * The source states.
     */
    sourceStates: { [id: string]: IDemoSourceState };
}
