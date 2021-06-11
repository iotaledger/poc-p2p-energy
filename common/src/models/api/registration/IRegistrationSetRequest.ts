export interface IRegistrationSetRequest {
    /**
     * The registration id of the item.
     */
    registrationId: string;
    /**
     * Name of the item
     */
    itemName?: string;
    /**
     * The type of the item
     */
    itemType?: string;
    /**
     * The initial root for the mam channel.
     */
    root?: string;
    /**
     * The private key for the mam channel.
     */
    sideKey?: string;
}
