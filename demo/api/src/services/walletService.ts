import { IAWSDynamoDbConfiguration } from "p2p-energy-common/dist/models/config/IAWSDynamoDbConfiguration";
import { AmazonDynamoDbService } from "p2p-energy-common/dist/services/amazon/amazonDynamoDbService";
import { IDemoWallet } from "../models/services/IDemoWallet";

/**
 * Service to store wallet states in AmazonS3.
 */
export class WalletService extends AmazonDynamoDbService<IDemoWallet> {
    /**
     * The name of the database table.
     */
    public static readonly TABLE_NAME: string = "wallet";

    /**
     * Create a new instance of WalletService
     * @param config The configuration.
     */
    constructor(config: IAWSDynamoDbConfiguration) {
        super(config, WalletService.TABLE_NAME, "id");
    }

    /**
     * Get the data for the wallet.
     * @param id The id for the wallet.
     * @returns The demo wallet.
     */
    public async getOrCreate(id: string): Promise<IDemoWallet> {
        let wallet = await super.get(id);

        if (!wallet) {
            try {
                wallet = {
                    id,
                    balance: 0
                };
                await super.set(wallet.id, wallet);

            } catch (err) {
            }
        }

        return wallet;
    }
}
