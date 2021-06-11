export interface ItemConfigureProps<T> {
    /**
     * The item data.
     */
    item: T;

    /**
     * The item was updated.
     */
    onChange(item?: T): void;
}
