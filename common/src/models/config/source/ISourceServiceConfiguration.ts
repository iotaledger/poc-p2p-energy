import { INodeConfiguration } from "../INodeConfiguration";
import { ISourceConfiguration } from "./ISourceConfiguration";

/**
 * Definition of configuration file.
 */
export interface ISourceServiceConfiguration {
    /**
     * The nodes to use for IOTA communication.
     */
    nodes: INodeConfiguration[];

    /**
     * Local storage location.
     */
    localStorageFolder?: string;

    /**
     * The endpoint where the producer api lives.
     */
    producerApiEndpoint: string;

    /**
     * Config for the source.
     */
    source: ISourceConfiguration;

    /**
     * A list of domains allowed to access the api.
     */
    allowedDomains: string[];
}
