/**
 * Definition of source stratey state.
 */
export interface IBasicSourceStrategyState {
    /**
     * The time of the last output command.
     */
    lastOutputTime?: number;

    /**
     * The total output from the source.
     */
    outputTotal?: number;
}
