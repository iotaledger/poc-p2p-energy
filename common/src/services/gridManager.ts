import { LoadBalancerSettings } from "@iota/client-load-balancer";
import { ServiceFactory } from "../factories/serviceFactory";
import { IGridConfiguration } from "../models/config/grid/IGridConfiguration";
import { IConsumerUsage } from "../models/db/grid/IConsumerUsage";
import { IConsumerUsageEntry } from "../models/db/grid/IConsumerUsageEntry";
import { IProducerOutput } from "../models/db/grid/IProducerOutput";
import { IProducerOutputEntry } from "../models/db/grid/IProducerOutputEntry";
import { IConsumerUsageCommand } from "../models/mam/IConsumerUsageCommand";
import { IMamCommand } from "../models/mam/IMamCommand";
import { IProducerOutputCommand } from "../models/mam/IProducerOutputCommand";
import { ILoggingService } from "../models/services/ILoggingService";
import { IStorageService } from "../models/services/IStorageService";
import { IRegistration } from "../models/services/registration/IRegistration";
import { IGridManagerState } from "../models/state/IGridManagerState";
import { IGridStrategy } from "../models/strategies/IGridStrategy";

/**
 * Service to handle the grid.
 */
export class GridManager<S> {
    /**
     * Configuration for the grid.
     */
    private readonly _config: IGridConfiguration;

    /**
     * Load balancer settings for communications.
     */
    // @ts-ignore
    private readonly _loadBalancerSettings: LoadBalancerSettings;

    /**
     * Service to log output to.
     */
    private readonly _loggingService: ILoggingService;

    /**
     * The strategy for generating processing outputs, usage and payments.
     */
    private readonly _strategy: IGridStrategy<S>;

    /**
     * The current state for the producer.
     */
    private _state?: IGridManagerState<S>;

    /**
     * Create a new instance of GridService.
     * @param gridConfig The configuration for the grid.
     * @param loadBalancerSettings Load balancer settings for communications.
     * @param strategy The strategy for generating processing outputs, usage and payments.
     */
    constructor(
        gridConfig: IGridConfiguration,
        loadBalancerSettings: LoadBalancerSettings,
        strategy: IGridStrategy<S>) {
        this._config = gridConfig;
        this._loadBalancerSettings = loadBalancerSettings;
        this._strategy = strategy;
        this._loggingService = ServiceFactory.get<ILoggingService>("logging");
    }

    /**
     * Get the state for the manager.
     * @returns The state of the grid manager.
     */
    public getState(): IGridManagerState<S> {
        return this._state;
    }

    /**
     * Initialise the grid.
     */
    public async initialise(): Promise<void> {
        await this.loadState();
        await this.saveState();
    }

    /**
     * Closedown the grid.
     */
    public async closedown(): Promise<void> {
        await this.saveState();
    }

    /**
     * Process commands for the registration.
     * @param registration The registration.
     * @param commands The commands to process.
     */
    public async handleCommands(registration: IRegistration, commands: IMamCommand[]): Promise<void> {
        const producerOutputStoreService = ServiceFactory.get<IStorageService<IProducerOutput>>(
            "grid-producer-output-store");
        const consumerUsageStoreService = ServiceFactory.get<IStorageService<IConsumerUsage>>(
            "grid-consumer-usage-store");

        let updateStore = false;
        let producerStore: IProducerOutput;
        let consumerStore: IConsumerUsage;

        if (registration.itemType === "producer") {
            producerStore = await producerOutputStoreService.get(`${this._config.id}/${registration.id}`);
        } else if (registration.itemType === "consumer") {
            consumerStore = await consumerUsageStoreService.get(`${this._config.id}/${registration.id}`);
        }

        for (let i = 0; i < commands.length; i++) {
            this._loggingService.log("grid", "Processing", commands[i]);
            if (commands[i].command === "hello" || commands[i].command === "goodbye") {
                // This mam channel will have handled any mam operation
                // at the moment there is nothing else for use to do
            } else if (commands[i].command === "output" && registration.itemType === "producer") {
                const outputCommand = commands[i] as IProducerOutputCommand;

                if (!producerStore) {
                    producerStore = {
                        id: registration.id,
                        output: []
                    };
                }

                // Only store output commands that we havent already seen
                if (!producerStore.output.find(o => o.startTime === outputCommand.startTime)) {
                    producerStore.output.push({
                        startTime: outputCommand.startTime,
                        endTime: outputCommand.endTime,
                        output: outputCommand.output,
                        producerPrice: outputCommand.price,
                        paymentIdOrAddress: outputCommand.paymentIdOrAddress
                    });

                    updateStore = true;
                }
            } else if (commands[i].command === "usage" && registration.itemType === "consumer") {
                const outputCommand = commands[i] as IConsumerUsageCommand;

                if (!consumerStore) {
                    consumerStore = {
                        id: registration.id,
                        usage: []
                    };
                }

                // Only store usage commands that we havent already seen
                if (!consumerStore.usage.find(o => o.startTime === outputCommand.startTime)) {
                    consumerStore.usage.push({
                        startTime: outputCommand.startTime,
                        endTime: outputCommand.endTime,
                        usage: outputCommand.usage
                    });

                    updateStore = true;
                }
            }
        }

        if (updateStore) {
            if (producerStore) {
                await producerOutputStoreService.set(`${this._config.id}/${registration.id}`, producerStore);
            }
            if (consumerStore) {
                await consumerUsageStoreService.set(`${this._config.id}/${registration.id}`, consumerStore);
            }
        }

        this._loggingService.log(
            "grid",
            `Processed ${commands ? commands.length : 0} commands for '${registration.itemName}'`
        );
    }

    /**
     * Update strategy to process payments for registered entites.
     * @returns Mam commands that need sending.
     */
    public async updateStrategy(): Promise<{ [id: string]: IMamCommand[] }> {
        const updatedState1 = await this.updateConsumers();
        const updatedState2 = await this.updateProducers();
        const updatedState3 = await this._strategy.payments(this._config, this._state);

        if (updatedState1.updatedState || updatedState2 || updatedState3.updatedState) {
            await this.saveState();
        }

        return updatedState1.returnCommands;
    }

    /**
     * Update the consumers using the strategy.
     * @returns If the state was updated and any commands to send.
     */
    private async updateConsumers(): Promise<{
        /**
         * Has the state been updated.
         */
        updatedState: boolean;
        /**
         * Any Mam commands to return.
         */
        returnCommands: { [id: string]: IMamCommand[] };
    }
    > {
        const consumerUsageStoreService = ServiceFactory.get<IStorageService<IConsumerUsage>>(
            "grid-consumer-usage-store");

        const consumerUsageById: { [id: string]: IConsumerUsageEntry[] } = {};

        let pageSize = 10;
        let page = 0;
        let pageResponse;
        do {
            pageResponse = await consumerUsageStoreService.page(undefined, page, pageSize);

            for (let i = 0; i < pageResponse.items.length; i++) {
                const consumerUsage: IConsumerUsage = pageResponse.items[i];
                consumerUsageById[consumerUsage.id] = consumerUsage.usage;
            }
            page++;
            pageSize = pageResponse.pageSize;
        } while (pageResponse && pageResponse.ids && pageResponse.ids.length > 0);

        const result = await this._strategy.consumers(this._config, consumerUsageById, this._state);

        // Remove all the consumed usage data from the storage
        for (const consumerId in consumerUsageById) {
            if (consumerUsageById[consumerId].length === 0) {
                await consumerUsageStoreService.remove(`${this._config.id}/${consumerId}`);
            }
        }

        const returnCommands: { [id: string]: IMamCommand[] } = {};

        // Now send any payment requests to the consumers
        for (const consumerId in result.paymentRequests) {
            returnCommands[consumerId] = [result.paymentRequests[consumerId]];
        }

        return {
            updatedState: result.updatedState,
            returnCommands
        };
    }

    /**
     * Update the producers using the strategy.
     * @returns True if the state was updated.
     */
    private async updateProducers(): Promise<boolean> {
        const producerOutputService = ServiceFactory.get<IStorageService<IProducerOutput>>(
            "grid-producer-output-store");

        const producerOutputById: { [id: string]: IProducerOutputEntry[] } = {};

        let pageSize = 10;
        let page = 0;
        let pageResponse;
        do {
            pageResponse = await producerOutputService.page(undefined, page, pageSize);

            for (let i = 0; i < pageResponse.items.length; i++) {
                const producer: IProducerOutput = pageResponse.items[i];
                producerOutputById[producer.id] = producer.output;
            }
            page++;
            pageSize = pageResponse.pageSize;
        } while (pageResponse && pageResponse.ids && pageResponse.ids.length > 0);

        const result = await this._strategy.producers(this._config, producerOutputById, this._state);

        for (const producerId in producerOutputById) {
            if (producerOutputById[producerId].length === 0) {
                await producerOutputService.remove(`${this._config.id}/${producerId}`);
            }
        }

        return result.updatedState;
    }

    /**
     * Load the state for the grid.
     * @private
     */
    private async loadState(): Promise<void> {
        const storageConfigService = ServiceFactory.get<IStorageService<IGridManagerState<S>>>(
            "grid-storage-manager-state");

        this._loggingService.log("grid", `Loading State`);
        this._state = await storageConfigService.get(this._config.id);
        this._loggingService.log("grid", `Loaded State`);

        this._state = this._state || {
            strategyState: await this._strategy.initState()
        };
    }

    /**
     * Store the state for the grid.
     */
    private async saveState(): Promise<void> {
        const storageConfigService = ServiceFactory.get<IStorageService<IGridManagerState<S>>>(
            "grid-storage-manager-state");

        this._loggingService.log("grid", `Storing State`);
        await storageConfigService.set(this._config.id, this._state);
        this._loggingService.log("grid", `Storing State Complete`);
    }
}
