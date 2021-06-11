import { composeAPI, LoadBalancerSettings } from "@iota/client-load-balancer";
import { generateAddress } from "@iota/core";
import { Inputs } from "@iota/core/typings/types";
import { ServiceFactory } from "../../factories/serviceFactory";
import { IWallet } from "../../models/api/wallet/IWallet";
import { IBasicWalletState } from "../../models/services/IBasicWalletState";
import { IStorageService } from "../../models/services/IStorageService";
import { IWalletService } from "../../models/services/IWalletService";
import { TrytesHelper } from "../../utils/trytesHelper";

/**
 * Service to handle wallet.
 */
export class BasicWalletService implements IWalletService {
    /**
     * Load balancer settings for communications.
     */
    private readonly _loadBalancerSettings: LoadBalancerSettings;

    /**
     * Wallet seed.
     */
    private readonly _walletSeed: string;

    /**
     * The config service.
     */
    private readonly _storageService: IStorageService<IBasicWalletState>;

    /**
     * Create a new instance of BasicWalletService
     * @param loadBalancerSettings Load balancer settings for communications.
     * @param walletSeed The wallet seed.
     */
    constructor(loadBalancerSettings: LoadBalancerSettings, walletSeed: string) {
        this._loadBalancerSettings = loadBalancerSettings;
        this._walletSeed = walletSeed;

        this._storageService = ServiceFactory.get<IStorageService<IBasicWalletState>>("wallet-state");
    }

    /**
     * Get the wallet details.
     * @param id The id of the wallet.
     * @param incomingEpoch Only return incoming transfers after the epoch.
     * @param outgoingEpoch Only return outgoing transfers after the epoch.
     * @returns The wallet.
     */
    public async getWallet(id: string, incomingEpoch?: number, outgoingEpoch?: number): Promise<IWallet> {
        let walletState = await this._storageService.get(id);

        if (!walletState) {
            const iota = composeAPI(
                this._loadBalancerSettings
            );

            const inputsResponse: Inputs = await iota.getInputs(this._walletSeed);
            let balance = 0;
            let startIndex = 0;
            let lastIndex = 0;

            if (inputsResponse && inputsResponse.inputs && inputsResponse.inputs.length > 0) {
                balance = inputsResponse.totalBalance;
                startIndex = inputsResponse.inputs[0].keyIndex;
                lastIndex = inputsResponse.inputs[inputsResponse.inputs.length - 1].keyIndex;
            }

            const receiveAddress = generateAddress(this._walletSeed, lastIndex + 1, 2);

            walletState = {
                balance,
                startIndex: startIndex,
                lastIndex: lastIndex + 2,
                receiveAddress
            };

            await this._storageService.set(id, walletState);
        }

        return {
            balance: walletState.balance
        };
    }

    /**
     * Make a payment from a wallet.
     * @param id The wallet id the payment is from.
     * @param toIdOrAddress The wallet id the payment is to or an address.
     * @param amount The amount of the payment.
     */
    public async transfer(
        id: string,
        toIdOrAddress: string,
        amount: number): Promise<void> {

        const walletStateFrom = await this._storageService.get(id);

        if (walletStateFrom) {
            const iota = composeAPI(
                this._loadBalancerSettings
            );

            const inputsResult = await iota.getInputs(this._walletSeed, { start: walletStateFrom.startIndex });

            walletStateFrom.startIndex = inputsResult.inputs[0].keyIndex;
            walletStateFrom.balance = inputsResult.totalBalance;

            const lastUsedIndex = Math.max(
                inputsResult.inputs[inputsResult.inputs.length - 1].keyIndex,
                walletStateFrom.lastIndex);

            walletStateFrom.lastIndex = lastUsedIndex + 1;

            await this._storageService.set(id, walletStateFrom);

            const remainderAddress = generateAddress(this._walletSeed, lastUsedIndex + 1, 2);

            const trytes = await iota.prepareTransfers(
                this._walletSeed,
                [
                    {
                        // The to ID in our basic wallet case is actually the IOTA address
                        address: toIdOrAddress,
                        value: amount,
                        tag: "P9TO9P9ENERGY9POC",
                        message: TrytesHelper.toTrytes({
                            from: id
                        })
                    }
                ],
                {
                    inputs: inputsResult.inputs,
                    remainderAddress
                });

            await iota.sendTrytes(trytes, undefined, undefined);
        }
    }
}
