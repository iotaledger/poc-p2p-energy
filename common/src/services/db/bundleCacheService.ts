import { IAWSDynamoDbConfiguration } from "../../models/config/IAWSDynamoDbConfiguration";
import { IBundle } from "../../models/db/IBundle";
import { AmazonDynamoDbService } from "../amazon/amazonDynamoDbService";

/**
 * Service to handle the bundle cache.
 */
export class BundleCacheService extends AmazonDynamoDbService<IBundle> {
    /**
     * The name of the database table.
     */
    public static readonly TABLE_NAME: string = "bundleCache";

    constructor(config: IAWSDynamoDbConfiguration) {
        super(config, BundleCacheService.TABLE_NAME, "id");
    }
}
