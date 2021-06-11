import { IResponse } from "../IResponse";

export interface IStorageGetResponse<T> extends IResponse {
    /**
     * The stored item.
     */
    item?: T;
}
