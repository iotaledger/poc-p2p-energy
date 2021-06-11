import { IIdItem } from "./IIdItem";

export interface ISource extends IIdItem {
    /**
     * The type of the source.
     */
    type: string;
}
