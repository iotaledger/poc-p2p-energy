import { ISource } from "../../../models/api/ISource";
import { SourceConfigureProps } from "./SourceConfigureProps";

export interface ProducerConfigureState {
    /**
     * The name of the producer.
     */
    name: string;

    /**
     * The list of sources.
     */
    sources: ISource[];

    /**
     * The source to configure.
     */
    configureSource?: SourceConfigureProps;

    /**
     * Is the form data valid.
     */
    isValid?: boolean;
}
