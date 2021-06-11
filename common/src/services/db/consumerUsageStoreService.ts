import { IAWSDynamoDbConfiguration } from "../../models/config/IAWSDynamoDbConfiguration";
import { IConsumerUsage } from "../../models/db/grid/IConsumerUsage";
import { AmazonDynamoDbService } from "../amazon/amazonDynamoDbService";

/**
 * Service to handle the consumer usage.
 */
export class ConsumerUsageStoreService extends AmazonDynamoDbService<IConsumerUsage> {
    /**
     * The name of the database table.
     */
    public static readonly TABLE_NAME: string = "consumerUsageStore";

    /**
     * Create a new instance of ConsumerUsageStoreService.
     * @param config Configuration for DB.
     */
    constructor(config: IAWSDynamoDbConfiguration) {
        super(config, ConsumerUsageStoreService.TABLE_NAME, "id");
    }
}
