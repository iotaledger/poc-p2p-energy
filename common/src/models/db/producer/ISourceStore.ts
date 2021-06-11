import { ISourceStoreOutput } from "./ISourceStoreOutput";

/**
 * Object definition for storing output from a source.
 */
export interface ISourceStore {
    /**
     * The id of the producers.
     */
    id: string;

    /**
     * The output records from the source.
     */
    output: ISourceStoreOutput[];
}
