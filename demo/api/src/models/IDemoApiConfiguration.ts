import { IAWSDynamoDbConfiguration } from "p2p-energy-common/dist/models/config/IAWSDynamoDbConfiguration";
import { IAWSS3Configuration } from "p2p-energy-common/dist/models/config/IAWSS3Configuration";
import { INodeConfiguration } from "p2p-energy-common/dist/models/config/INodeConfiguration";
/**
 * Definition of configuration file.
 */
export interface IDemoApiConfiguration {
    /**
     * The nodes to use for IOTA communication.
     */
    nodes: INodeConfiguration[];

    /**
     * Local storage location.
     */
    localStorageFolder?: string;

    /**
     * The dynamic db connection.
     */
    dynamoDbConnection?: IAWSDynamoDbConfiguration;

    /**
     * S3 storage connection.
     */
    s3Connection?: IAWSS3Configuration;

    /**
     * Demonstration wallet seed.
     */
    walletSeed: string;

    /**
     * A list of domains allowed to access the api.
     */
    allowedDomains: string[];
}
