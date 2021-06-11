import { IPagedRequest } from "../IPagedRequest";

export interface IStorageListRequest extends IPagedRequest {
    /**
     * The registration id of the item.
     */
    registrationId: string;

    /**
     * The context of the item.
     */
    context: string;
}
