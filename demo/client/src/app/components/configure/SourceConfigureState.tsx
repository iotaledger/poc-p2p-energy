export interface SourceConfigureState {
    /**
     * The name of the source.
     */
    name: string;

    /**
     * The type of the source.
     */
    type: string;

    /**
     * Output type.
     */
    outputType: "random" | "fixed";

    /**
     * Fixed output value.
     */
    outputValue: string;

    /**
     * Is the form data valid.
     */
    isValid?: boolean;
}
