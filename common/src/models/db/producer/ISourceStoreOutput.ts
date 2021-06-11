/**
 * Object definition for storing output from a source.
 */
export interface ISourceStoreOutput {
    /**
     * The startTime for the producers output.
     */
    startTime: number;

    /**
     * The endTime for the producers output.
     */
    endTime: number;

    /**
     * The output for the producer in kWh.
     */
    output: number;
}
