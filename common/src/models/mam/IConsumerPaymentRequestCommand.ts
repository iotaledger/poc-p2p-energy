import { IMamCommand } from "./IMamCommand";

export interface IConsumerPaymentRequestCommand extends IMamCommand {
    /**
     * The amount in IOTA requested from the consumer.
     */
    owed: number;

    /**
     * The usage amount that the request is for.
     */
    usage: number;

    /**
     * The id of the item we are making the payment to, this could be an IOTA address.
     */
    paymentIdOrAddress: string;
}
