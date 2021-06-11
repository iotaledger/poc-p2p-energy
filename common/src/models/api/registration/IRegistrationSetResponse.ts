import { IResponse } from "../IResponse";

export interface IRegistrationSetResponse extends IResponse {
    /**
     * The root used for the channel from the registration.
     */
    root?: string;
    /**
     * The private key used for decoding the channel.
     */
    sideKey?: string;
}
