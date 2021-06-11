import { ServiceFactory } from "p2p-energy-common/dist/factories/serviceFactory";
import { IResponse } from "p2p-energy-common/dist/models/api/IResponse";
import { IWalletTransferRequest } from "p2p-energy-common/dist/models/api/wallet/IWalletTransferRequest";
import { ValidationHelper } from "p2p-energy-common/dist/utils/validationHelper";
import { IDemoApiConfiguration } from "../../models/IDemoApiConfiguration";
import { WalletTransferService } from "../../services/walletTransferService";

/**
 * Transfer a payment between entities.
 * @param config The service configuration.
 * @param request The request for the route.
 * @returns The route response.
 */
export async function transferPost(
    config: IDemoApiConfiguration,
    request: IWalletTransferRequest):
    Promise<IResponse> {

    ValidationHelper.trytes(request.id, 36, "id");
    ValidationHelper.trytes(request.toIdOrAddress, 36, "toIdOrAddress");
    ValidationHelper.number(request.amount, "amount");

    const walletTransferService = ServiceFactory.get<WalletTransferService>("wallet-transfer");
    walletTransferService.addTransfer(
        {
            value: request.amount,
            tag: "P9TO9P9ENERGY9POC",
            transfer: {
                from: request.id,
                to: request.toIdOrAddress
            }
        }
    );

    return {
        success: true,
        message: "OK"
    };
}
