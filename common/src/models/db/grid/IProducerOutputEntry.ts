/**
 * Object definition for storing output from a producer.
 */
export interface IProducerOutputEntry {
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
     * The price the producer would like for this output per kWh.
     */
    producerPrice: number;

    /**
     * The id of the item we are making the payment to, this could be an IOTA address.
     */
    paymentIdOrAddress: string;
}
