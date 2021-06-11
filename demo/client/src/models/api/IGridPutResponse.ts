import { IResponse } from "p2p-energy-common/dist/models/api/IResponse";

export interface IGridPutResponse extends IResponse {
    /**
     * The encrypted password.
     */
    password?: string;
}
