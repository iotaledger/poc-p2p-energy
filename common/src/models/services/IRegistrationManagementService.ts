import { IMamCommand } from "../mam/IMamCommand";
import { IRegistration } from "./registration/IRegistration";

/**
 * Service to manage registrations.
 */
export interface IRegistrationManagementService {
    /**
     * Add a new registration.
     * @param registration The registration details.
     * @param root The client mam channel root.
     * @param sideKey The client mam channel side key.
     */
    addRegistration(registration: IRegistration, root: string, sideKey: string): Promise<void>;

    /**
     * Remove a registration from the service.
     * @param registration The registration details.
     * @param sideKey The client mam channel side key used for remove validation.
     */
    removeRegistration(registrationId: string, sideKey: string): Promise<void>;

    /**
     * Load the registrations to initialise the queues.
     */
    loadRegistrations(): Promise<void>;

    /**
     * Look for new commands for each registration.
     * @param handleCommands Handle any new commands found from the registration.
     */
    pollCommands(
        handleCommands: (
            registration: IRegistration,
            commands: IMamCommand[]) => Promise<void>): Promise<void>;

    /**
     * Send commands to the return channel.
     * @param returnCommands The commands to return to the registrations.
     */
    returnCommands(commands: { [registrationId: string]: IMamCommand[] }): Promise<void>;
}
