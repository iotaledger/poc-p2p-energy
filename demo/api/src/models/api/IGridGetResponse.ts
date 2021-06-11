import { IResponse } from "p2p-energy-common/dist/models/api/IResponse";
import { IGrid } from "./IGrid";

export interface IGridGetResponse extends IResponse {
    /**
     * The data for the grid.
     */
    grid?: IGrid;
}
