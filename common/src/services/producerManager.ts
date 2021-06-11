import { LoadBalancerSettings } from "@iota/client-load-balancer";
import { ServiceFactory } from "../factories/serviceFactory";
import { IProducerConfiguration } from "../models/config/producer/IProducerConfiguration";
import { ISourceStore } from "../models/db/producer/ISourceStore";
import { ISourceStoreOutput } from "../models/db/producer/ISourceStoreOutput";
import { IMamCommand } from "../models/mam/IMamCommand";
import { IProducerOutputCommand } from "../models/mam/IProducerOutputCommand";
import { ISourceOutputCommand } from "../models/mam/ISourceOutputCommand";
import { ILoggingService } from "../models/services/ILoggingService";
import { IRegistrationService } from "../models/services/IRegistrationService";
import { IStorageService } from "../models/services/IStorageService";
import { IRegistration } from "../models/services/registration/IRegistration";
import { IProducerManagerState } from "../models/state/IProducerManagerState";
import { IProducerStrategy } from "../models/strategies/IProducerStrategy";
import { MamCommandChannel } from "./mamCommandChannel";

/**
 * Class to maintain a Producer.
 */
export class ProducerManager<S> {
    /**
     * Configuration for the producer.
     */
    private readonly _config: IProducerConfiguration;

    /**
     * Load balancer settings for communications.
     */
    private readonly _loadBalancerSettings: LoadBalancerSettings;

    /**
     * Service to log output to.
     */
    private readonly _loggingService: ILoggingService;

    /**
     * Registration service.
     */
    private readonly _registrationService: IRegistrationService;

    /**
     * The strategy for generating output commands.
     */
    private readonly _strategy: IProducerStrategy<S>;

    /**
     * The current state for the producer.
     */
    private _state?: IProducerManagerState<S>;

    /**
     * Create a new instance of ProducerService.
     * @param producerConfig The configuration for the producer.
     * @param loadBalancerSettings Load balancer settings for communications.
     * @param strategy The strategy for producing output commands.
     */
    constructor(
        producerConfig: IProducerConfiguration,
        loadBalancerSettings: LoadBalancerSettings,
        strategy: IProducerStrategy<S>) {
        this._config = producerConfig;
        this._loadBalancerSettings = loadBalancerSettings;
        this._strategy = strategy;
        this._loggingService = ServiceFactory.get<ILoggingService>("logging");
        this._registrationService = ServiceFactory.get<IRegistrationService>("producer-registration");
    }

    /**
     * Get the state for the manager.
     * @returns The state of the producer manager.
     */
    public getState(): IProducerManagerState<S> {
        return this._state;
    }

    /**
     * Initialise the producer by registering with the Grid.
     */
    public async initialise(): Promise<void> {
        await this.loadState();

        this._loggingService.log("producer-init", "Registering with Grid");

        await this._registrationService.register(
            this._config.id,
            this._config.name,
            "producer",
            this._state && this._state.channel && this._state.channel.initialRoot,
            this._state && this._state.channel && this._state.channel.sideKey
        );
        this._loggingService.log("producer-init", `Registered with Grid`);

        if (this._state.channel) {
            this._loggingService.log("producer-init", `Channel Config already exists`);
        } else {
            this._loggingService.log("producer-init", `Channel Config not found`);
            this._loggingService.log("producer-init", `Creating Channel`);

            const itemMamChannel = new MamCommandChannel(this._loadBalancerSettings);

            this._state.channel = {};
            await itemMamChannel.openWritable(this._state.channel);

            this._loggingService.log("producer-init", `Creating Channel Success`);

            this._loggingService.log("producer-init", `Updating Registration`);
            await this._registrationService.register(
                this._config.id,
                this._config.name,
                "producer",
                this._state.channel.initialRoot,
                this._state.channel.sideKey
            );
            this._loggingService.log("producer-init", `Updated Registration`);
        }
        this._loggingService.log("producer-init", `Registration Complete`);

        await this.saveState();
    }

    /**
     * Reset the producer channel.
     */
    public async reset(): Promise<void> {
        if (this._state && this._state.channel) {
            this._loggingService.log("producer-reset", `Send Channel Reset`);

            const mamCommandChannel = new MamCommandChannel(this._loadBalancerSettings);
            await mamCommandChannel.reset(this._state.channel);

            await this.saveState();

            this._loggingService.log("producer-reset", `Updating Registration with Grid`);
            await this._registrationService.register(
                this._config.id,
                this._config.name,
                "producer",
                this._state.channel.initialRoot,
                this._state.channel.sideKey
            );
            this._loggingService.log("producer-reset", `Updated Registration with Grid`);
        }
    }

    /**
     * Closedown the producer by unregistering from the Grid.
     */
    public async closedown(): Promise<void> {
        let sideKey;

        if (this._state && this._state.channel) {
            sideKey = this._state.channel.sideKey;

            this._loggingService.log("producer-closedown", `Sending Goodbye`);

            const itemMamChannel = new MamCommandChannel(this._loadBalancerSettings);

            await itemMamChannel.closeWritable(this._state.channel);

            this._loggingService.log("producer-closedown", `Sending Goodbye Complete`);

            this._state.channel = undefined;
        }

        this._loggingService.log("producer-closedown", `Unregistering from the Grid`);

        await this._registrationService.unregister(this._config.id, sideKey);

        this._loggingService.log("producer-closedown", `Unregistered from the Grid`);
    }

    /**
     * Process commands for the registration.
     * @param registration The registration.
     * @param commands The commands to process.
     */
    public async handleCommands(registration: IRegistration, commands: IMamCommand[]): Promise<void> {
        const sourceStoreService = ServiceFactory.get<IStorageService<ISourceStore>>(
            "producer-source-output-store");
        let store = await sourceStoreService.get(`${this._config.id}/${registration.id}`);
        let updatedStore = false;

        for (let i = 0; i < commands.length; i++) {
            this._loggingService.log("grid", "Processing", commands[i]);
            if (commands[i].command === "hello" || commands[i].command === "goodbye") {
                // This mam channel will have handled any mam operation
                // at the moment there is nothing else for use to do
            } else if (commands[i].command === "output") {
                const outputCommand = commands[i] as ISourceOutputCommand;

                if (!store) {
                    store = {
                        id: registration.id,
                        output: []
                    };
                }

                // Only store output commands that we havent already seen
                if (!store.output.find(o => o.startTime === outputCommand.startTime)) {
                    store.output.push({
                        startTime: outputCommand.startTime,
                        endTime: outputCommand.endTime,
                        output: outputCommand.output
                    });

                    updatedStore = true;
                }
            }
        }

        if (updatedStore) {
            await sourceStoreService.set(`${this._config.id}/${registration.id}`, store);
        }

        this._loggingService.log(
            "producer",
            `Processed ${commands ? commands.length : 0} commands for '${registration.itemName}'`
        );
    }

    /**
     * Combine the information from the sources and generate an output command.
     * @returns Any new producer output commands.
     */
    public async updateStrategy(): Promise<IProducerOutputCommand[]> {
        if (this._state && this._state.channel) {
            const sourceStoreService = ServiceFactory.get<IStorageService<ISourceStore>>(
                "producer-source-output-store");

            const sourceOutputById: { [id: string]: ISourceStoreOutput[] } = {};

            let pageSize = 10;
            let page = 0;
            let pageResponse;
            do {
                // Get the sources page at a time
                pageResponse = await sourceStoreService.page(this._config.id, page, pageSize);
                if (pageResponse && pageResponse.items) {
                    for (let i = 0; i < pageResponse.items.length; i++) {
                        const source: ISourceStore = pageResponse.items[i];
                        sourceOutputById[source.id] = source.output;
                    }
                }
                page++;
                pageSize = pageResponse.pageSize;
            } while (pageResponse && pageResponse.items && pageResponse.items.length > 0);

            const result1 = await this._strategy.sources(this._config, sourceOutputById, this._state);

            this._state.unsentCommands = this._state.unsentCommands.concat(result1.commands);

            if (this._state.unsentCommands.length > 0) {
                const mamCommandChannel = new MamCommandChannel(this._loadBalancerSettings);
                this._state.unsentCommands = await mamCommandChannel.sendCommandQueue(
                    this._state.channel,
                    this._state.unsentCommands
                );
            }

            for (const sourceId in sourceOutputById) {
                if (sourceOutputById[sourceId].length === 0) {
                    await sourceStoreService.remove(`${this._config.id}/${sourceId}`);
                }
            }

            const result2 = await this._strategy.payments(this._config, this._state);

            if (result1.updatedState || result2.updatedState) {
                await this.saveState();
            }

            return result1.commands;
        }

        return [];
    }

    /**
     * Load the state for the producer.
     */
    private async loadState(): Promise<void> {
        const storageConfigService = ServiceFactory.get<IStorageService<IProducerManagerState<S>>>(
            "producer-storage-manager-state");

        this._loggingService.log("producer", `Loading State`);
        this._state = await storageConfigService.get(this._config.id);
        this._loggingService.log("producer", `Loaded State`);

        this._state = this._state || {
            strategyState: await this._strategy.initState(),
            unsentCommands: []
        };
    }

    /**
     * Store the state for the producer.
     */
    private async saveState(): Promise<void> {
        const storageConfigService = ServiceFactory.get<IStorageService<IProducerManagerState<S>>>(
            "producer-storage-manager-state");

        this._loggingService.log("producer", `Storing State`);
        await storageConfigService.set(this._config.id, this._state);
        this._loggingService.log("producer", `Storing State Complete`);
    }
}
