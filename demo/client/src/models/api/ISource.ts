import { IIdItem } from "./IIdItem";

export interface ISource extends IIdItem {
    /**
     * The type of the source.
     */
    type: string;

    /**
     * Extended properties for the source.
     */
    extendedProperties?: { [id: string]: any };
}
