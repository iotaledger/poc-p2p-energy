import { IMamCommand } from "./IMamCommand";

export interface IConsumerUsageCommand extends IMamCommand {
    /**
     * The startTime for the consumers usage.
     */
    startTime: number;

    /**
     * The endTime for the consumers usage.
     */
    endTime: number;

    /**
     * The usage for the consumer in kWh.
     */
    usage: number;
}
