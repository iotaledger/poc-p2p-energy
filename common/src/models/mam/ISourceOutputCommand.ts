import { IMamCommand } from "./IMamCommand";

export interface ISourceOutputCommand extends IMamCommand {
    /**
     * The startTime for the sources output.
     */
    startTime: number;

    /**
     * The endTime for the sources output.
     */
    endTime: number;

    /**
     * The output for the source in kWh.
     */
    output: number;
}
