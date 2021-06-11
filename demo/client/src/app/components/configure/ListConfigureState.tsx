import { IIdItem } from "../../../models/api/IIdItem";

export interface ListConfigureState<T extends IIdItem> {
    /**
     * The items in the list.
     */
    items: T[];

    /**
     * Is an item being configured.
     */
    configuring: boolean;

    /**
     * The item to delete.
     */
    deleteItem?: T;

    /**
     * Show the reached max entries dialog.
     */
    showMaxDialog?: boolean;
}
