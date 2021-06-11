import { INodeConfiguration } from "../INodeConfiguration";
import { IProducerConfiguration } from "./IProducerConfiguration";

/**
 * Definition of configuration file.
 */
export interface IProducerServiceConfiguration {
    /**
     * The nodes to use for IOTA communication.
     */
    nodes: INodeConfiguration[];

    /**
     * Local storage location.
     */
    localStorageFolder?: string;

    /**
     * The endpoint where the grid api lives.
     */
    gridApiEndpoint: string;

    /**
     * Config for the producer.
     */
    producer: IProducerConfiguration;

    /**
     * Seed for the producer.
     */
    seed: string;

    /**
     * A list of domains allowed to access the api.
     */
    allowedDomains: string[];
}
