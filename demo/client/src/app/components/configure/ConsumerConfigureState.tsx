export interface ConsumerConfigureState {
    /**
     * The name of the consumer.
     */
    name: string;

    /**
     * Usage type.
     */
    usageType: "random" | "fixed";

    /**
     * Fixed usage value.
     */
    usageValue: string;

    /**
     * Is the form data valid.
     */
    isValid?: boolean;
}
