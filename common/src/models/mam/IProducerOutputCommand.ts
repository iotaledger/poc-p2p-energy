import { IMamCommand } from "./IMamCommand";

export interface IProducerOutputCommand extends IMamCommand {
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

    /**
     * The price the producer would like for this output per kWh, not guaranteed to receive.
     */
    price: number;

    /**
     * The id of the item we are making the payment to, this could be an IOTA address.
     */
    paymentIdOrAddress: string;
}
