import { IPagedResponse } from "../IPagedResponse";
import { IResponse } from "../IResponse";

export interface IStorageListResponse<T> extends IResponse, IPagedResponse<T> {
    /**
     * The stored item ids.
     */
    ids?: string[];
}
