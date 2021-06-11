
import { IDemoWalletTransferPayload } from "./IDemoWalletTransferPayload";

export interface IDemoWalletTransfer {
    /**
     * The message.
     */
    transfer: IDemoWalletTransferPayload;
    /**
     * The transfer tag.
     */
    tag: string;
    /**
     * The amount.
     */
    value: number;
    /**
     * The transfer address.
     */
    address?: string;
    /**
     * The bundle hash.
     */
    bundle?: string;
    /**
     * The time the bundle was created.
     */
    created?: number;
}
