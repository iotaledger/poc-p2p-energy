import { IAWSDynamoDbConfiguration } from "../../models/config/IAWSDynamoDbConfiguration";
import { IProducerOutput } from "../../models/db/grid/IProducerOutput";
import { AmazonDynamoDbService } from "../amazon/amazonDynamoDbService";

/**
 * Service to handle the producer store.
 */
export class ProducerOutputStoreService extends AmazonDynamoDbService<IProducerOutput> {
    /**
     * The name of the database table.
     */
    public static readonly TABLE_NAME: string = "producerOutputStore";

    /**
     * Create a new instance of ProducerOutputStoreService.
     * @param config Configuration for DB.
     */
    constructor(config: IAWSDynamoDbConfiguration) {
        super(config, ProducerOutputStoreService.TABLE_NAME, "id");
    }
}
