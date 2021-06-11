import { IIdItem } from "../../../models/api/IIdItem";
import { ItemConfigureProps } from "./ItemConfigureProps";

export interface ListConfigureProps<T extends IIdItem> {
    /**
     * The name of an item.
     */
    itemName: string;

    /**
     * The plural name of an item.
     */
    pluralName: string;

    /**
     * The items in the list.
     */
    items: T[];

    /**
     * The maximum number of entries we can store in the list.
     */
    maxItems: number;

    /**
     * Element to use for configuration.
     */
    configure(props: ItemConfigureProps<T>): void;

    /**
     * Create a new instace.
     */
    newInstance(): T;

    /**
     * The list was updated.
     */
    onChange(items: T[]): void;
}
