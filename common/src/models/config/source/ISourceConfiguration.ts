/**
 * Definition of source configuration file.
 */
export interface ISourceConfiguration {
    /**
     * The id of the source.
     */
    id: string;

    /**
     * The name of the source.
     */
    name: string;

    /**
     * The type of the source.
     */
    type: string;

    /**
     * Extended properties for the source.
     */
    extendedProperties?: { [id: string]: any };
}
