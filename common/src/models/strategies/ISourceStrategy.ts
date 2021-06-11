import { ISourceOutputCommand } from "../../models/mam/ISourceOutputCommand";
import { ISourceManagerState } from "../../models/state/ISourceManagerState";
import { ISourceConfiguration } from "../config/source/ISourceConfiguration";

/**
 * Interface definition for source strategy for calculating outputs
 */
export interface ISourceStrategy<S> {
    /**
     * Initialise the state.
     */
    initState(): Promise<S>;

    /**
     * Gets the output values.
     * @param config The config of the source.
     * @param sourceState The state for the manager calling the strategy
     * @returns List of output commands.
     */
    value(config: ISourceConfiguration, sourceState: ISourceManagerState<S>): Promise<{
        /**
         * Has the state been updated.
         */
        updatedState: boolean;
        /**
         * New commands to output.
         */
        commands: ISourceOutputCommand[];
    }>;
}
