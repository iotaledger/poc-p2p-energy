import { composeAPI, LoadBalancerSettings } from "@iota/client-load-balancer";
import { IAWSDynamoDbConfiguration } from "../../models/config/IAWSDynamoDbConfiguration";
import { ITransaction } from "../../models/db/ITransaction";
import { AmazonDynamoDbService } from "../amazon/amazonDynamoDbService";

/**
 * Service to handle the transaction cache.
 */
export class TransactionCacheService extends AmazonDynamoDbService<ITransaction> {
    /**
     * The name of the database table.
     */
    public static readonly TABLE_NAME: string = "transactionCache";

    /**
     * Load balancer settings for communications.
     */
    private readonly _loadBalancerSettings: LoadBalancerSettings;

    /**
     * Create a new instance of TransactionCacheService.
     * @param config The configuration to use.
     * @param loadBalancerSettings Load balancer settings for communications.
     */
    constructor(config: IAWSDynamoDbConfiguration, loadBalancerSettings: LoadBalancerSettings) {
        super(config, TransactionCacheService.TABLE_NAME, "id");
        this._loadBalancerSettings = loadBalancerSettings;
    }

    /**
     * Get the transaction with the given hash.
     * @param id The hash id.
     * @returns The transaction.
     */
    public async get(id: string): Promise<ITransaction> {
        try {
            const iota = composeAPI(this._loadBalancerSettings);

            const getTrytesResponse = await iota.getTrytes([id]);
            if (getTrytesResponse && getTrytesResponse.length > 0) {
                return {
                    id,
                    trytes: getTrytesResponse[0]
                };
            }
        } catch (err) {
        }

        return super.get(id);
    }
}
