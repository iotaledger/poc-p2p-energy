import { IIdItem } from "./IIdItem";

// tslint:disable-next-line:no-empty-interface
export interface IConsumer extends IIdItem {
    /**
     * Extended properties for the source.
     */
    extendedProperties?: { [id: string]: any };
}
