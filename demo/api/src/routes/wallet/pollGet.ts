import { LoadBalancerSettings } from "@iota/client-load-balancer";
import { ServiceFactory } from "p2p-energy-common/dist/factories/serviceFactory";
import { IDemoApiConfiguration } from "../../models/IDemoApiConfiguration";
import { WalletTransferService } from "../../services/walletTransferService";

/**
 * Poll for any wallet transfers to send.
 * @param config The service configuration.
 * @param request The request for the route.
 * @returns The route response.
 */
export async function pollGet(
    config: IDemoApiConfiguration,
    request: any):
    Promise<any> {

    const walletTransferService = ServiceFactory.get<WalletTransferService>("wallet-transfer");

    await walletTransferService.poll(
        ServiceFactory.get<LoadBalancerSettings>("load-balancer-settings"));

    return {
        success: true,
        message: "OK"
    };
}
