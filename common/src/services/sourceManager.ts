import { LoadBalancerSettings } from "@iota/client-load-balancer";
import { ServiceFactory } from "../factories/serviceFactory";
import { ISourceConfiguration } from "../models/config/source/ISourceConfiguration";
import { ISourceOutputCommand } from "../models/mam/ISourceOutputCommand";
import { ILoggingService } from "../models/services/ILoggingService";
import { IRegistrationService } from "../models/services/IRegistrationService";
import { IStorageService } from "../models/services/IStorageService";
import { ISourceManagerState } from "../models/state/ISourceManagerState";
import { ISourceStrategy } from "../models/strategies/ISourceStrategy";
import { MamCommandChannel } from "./mamCommandChannel";
/**
 * Class to handle a source.
 */
export class SourceManager<S> {
    /**
     * Configuration for the source.
     */
    private readonly _config: ISourceConfiguration;

    /**
     * Load balancer settings for communications.
     */
    private readonly _loadBalancerSettings: LoadBalancerSettings;

    /**
     * Registration service.
     */
    private readonly _registrationService: IRegistrationService;

    /**
     * Logging service.
     */
    private readonly _loggingService: ILoggingService;

    /**
     * The current state for the source.
     */
    private _state?: ISourceManagerState<S>;

    /**
     * The strategy for generating output commands.
     */
    private readonly _strategy: ISourceStrategy<S>;

    /**
     * Create a new instance of SourceService.
     * @param sourceConfig The configuration for the source.
     * @param loadBalancerSettings Load balancer settings for communications.
     * @param strategy The strategy for producing output commands.
     */
    constructor(
        sourceConfig: ISourceConfiguration,
        loadBalancerSettings: LoadBalancerSettings,
        strategy: ISourceStrategy<S>) {
        this._config = sourceConfig;
        this._loadBalancerSettings = loadBalancerSettings;
        this._strategy = strategy;
        this._loggingService = ServiceFactory.get<ILoggingService>("logging");
        this._registrationService = ServiceFactory.get<IRegistrationService>("source-registration");
    }

    /**
     * Get the state for the manager.
     * @returns The state of the source manager.
     */
    public getState(): ISourceManagerState<S> {
        return this._state;
    }

    /**
     * Register the source with the Producer.
     * @param configuration The configuration to use.
     */
    public async initialise(): Promise<void> {
        await this.loadState();

        this._loggingService.log("source-init", "Registering with Producer");

        await this._registrationService.register(
            this._config.id,
            this._config.name,
            this._config.type,
            this._state && this._state.channel && this._state.channel.initialRoot,
            this._state && this._state.channel && this._state.channel.sideKey
        );
        this._loggingService.log("source-init", `Registered with Producer`);

        if (this._state.channel) {
            this._loggingService.log("source-init", `Channel Config already exists`);
        } else {
            this._loggingService.log("source-init", `Channel Config not found`);
            this._loggingService.log("source-init", `Creating Channel`);

            const itemMamChannel = new MamCommandChannel(this._loadBalancerSettings);

            this._state.channel = {};
            await itemMamChannel.openWritable(this._state.channel);

            this._loggingService.log("source-init", `Creating Channel Success`);

            this._loggingService.log("source-init", `Updating Registration`);
            await this._registrationService.register(
                this._config.id,
                this._config.name,
                this._config.type,
                this._state.channel.initialRoot,
                this._state.channel.sideKey
            );
            this._loggingService.log("source-init", `Updated Registration`);
        }
        this._loggingService.log("source-init", `Registration Complete`);

        await this.saveState();
    }

    /**
     * Unregister the source from the Producer.
     */
    public async closedown(): Promise<void> {
        let sideKey;
        if (this._state && this._state.channel) {
            sideKey = this._state.channel.sideKey;

            this._loggingService.log("source", `Sending Goodbye`);

            const itemMamChannel = new MamCommandChannel(this._loadBalancerSettings);

            await itemMamChannel.closeWritable(this._state.channel);

            this._loggingService.log("source", `Sending Goodbye Complete`);

            this._state.channel = undefined;
        }

        this._loggingService.log("source", `Unregistering from the Producer`);

        await this._registrationService.unregister(this._config.id, sideKey);

        this._loggingService.log("source", `Unregistered from the Producer`);
    }

    /**
     * Call the strategy to produce values for the source.
     * @returns Any new source output commands.
     */
    public async updateStrategy(): Promise<ISourceOutputCommand[]> {
        const result = await this._strategy.value(this._config, this._state);

        this._state.unsentCommands = this._state.unsentCommands.concat(result.commands);

        if (this._state.channel && this._state.unsentCommands.length > 0) {
            const mamCommandChannel = new MamCommandChannel(this._loadBalancerSettings);

            this._state.unsentCommands = await mamCommandChannel.sendCommandQueue(
                this._state.channel,
                this._state.unsentCommands);
        }

        if (result.updatedState) {
            await this.saveState();
        }

        return result.commands;
    }

    /**
     * Load the state for the producer.
     */
    private async loadState(): Promise<void> {
        const storageConfigService = ServiceFactory.get<IStorageService<ISourceManagerState<S>>>(
            "source-storage-manager-state");

        this._loggingService.log("source", `Loading State`);
        this._state = await storageConfigService.get(this._config.id);
        this._loggingService.log("source", `Loaded State`);

        this._state = this._state || {
            strategyState: await this._strategy.initState(),
            unsentCommands: []
        };
    }

    /**
     * Store the state for the source.
     */
    private async saveState(): Promise<void> {
        const storageConfigService = ServiceFactory.get<IStorageService<ISourceManagerState<S>>>(
            "source-storage-manager-state");

        this._loggingService.log("source", `Storing State`);
        await storageConfigService.set(this._config.id, this._state);
        this._loggingService.log("source", `Storing State Complete`);
    }
}
