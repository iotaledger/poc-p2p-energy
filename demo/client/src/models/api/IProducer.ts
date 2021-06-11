import { IIdItem } from "./IIdItem";
import { ISource } from "./ISource";

export interface IProducer extends IIdItem {
    /**
     * The list of sources.
     */
    sources: ISource[];
}
