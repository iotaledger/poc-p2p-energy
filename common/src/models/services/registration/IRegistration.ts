import { IMamChannelConfiguration } from "../../mam/IMamChannelConfiguration";
import { IMamCommand } from "../../mam/IMamCommand";

export interface IRegistration {
    /**
     * Registration id.
     */
    id: string;

    /**
     * When was the registration created.
     */
    created: number;

    /**
     * Name of the item.
     */
    itemName: string;

    /**
     * The type of the item.
     */
    itemType: string;

    /**
     * The configuration for the items MAM channel.
     */
    itemMamChannel?: IMamChannelConfiguration;

    /**
     * The configuration for the return item MAM channel.
     */
    returnMamChannel?: IMamChannelConfiguration;

    /**
     * Any mam commands that have not yet been sent through the return channel.
     */
    unsentReturnCommands?: IMamCommand[];
}
