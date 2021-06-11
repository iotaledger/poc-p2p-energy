import { ISourceOutputCommand } from "p2p-energy-common/dist/models/mam/ISourceOutputCommand";
import { ISourceManagerState } from "p2p-energy-common/dist/models/state/ISourceManagerState";
import { IBasicSourceStrategyState } from "p2p-energy-common/dist/models/strategies/IBasicSourceStrategyState";

export interface IDemoSourceState {
    /**
     * The source manager state.
     */
    sourceManagerState: ISourceManagerState<IBasicSourceStrategyState>;

    /**
     * The output commands from the source.
     */
    outputCommands: ISourceOutputCommand[];
}
