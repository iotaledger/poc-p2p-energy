import { LoadBalancerSettings } from "@iota/client-load-balancer";
import { ServiceFactory } from "../factories/serviceFactory";
import { IConsumerConfiguration } from "../models/config/consumer/IConsumerConfiguration";
import { IConsumerPaymentRequestCommand } from "../models/mam/IConsumerPaymentRequestCommand";
import { IConsumerUsageCommand } from "../models/mam/IConsumerUsageCommand";
import { ILoggingService } from "../models/services/ILoggingService";
import { IRegistrationService } from "../models/services/IRegistrationService";
import { IStorageService } from "../models/services/IStorageService";
import { IConsumerManagerState } from "../models/state/IConsumerManagerState";
import { IConsumerStrategy } from "../models/strategies/IConsumerStrategy";
import { MamCommandChannel } from "./mamCommandChannel";

/**
 * Class to handle a consumer.
 */
export class ConsumerManager<S> {
    /**
     * Configuration for the consumer.
     */
    private readonly _config: IConsumerConfiguration;

    /**
     * Load balancer settings for communications.
     */
    private readonly _loadBalancerSettings: LoadBalancerSettings;

    /**
     * Logging service.
     */
    private readonly _loggingService: ILoggingService;

    /**
     * Registration service.
     */
    private readonly _registrationService: IRegistrationService;

    /**
     * The current state for the consumer.
     */
    private _state?: IConsumerManagerState<S>;

    /**
     * The strategy for generating output commands.
     */
    private readonly _strategy: IConsumerStrategy<S>;

    /**
     * Create a new instance of ConsumerService.
     * @param consumerConfig The configuration for the consumer.
     * @param loadBalancerSettings Load balancer settings for communications.
     * @param strategy The strategy for producing usage commands.
     */
    constructor(
        consumerConfig: IConsumerConfiguration,
        loadBalancerSettings: LoadBalancerSettings,
        strategy: IConsumerStrategy<S>) {
        this._config = consumerConfig;
        this._loadBalancerSettings = loadBalancerSettings;
        this._strategy = strategy;
        this._loggingService = ServiceFactory.get<ILoggingService>("logging");
        this._registrationService = ServiceFactory.get<IRegistrationService>("consumer-registration");
    }

    /**
     * Get the state for the manager.
     * @returns The state of the manager.
     */
    public getState(): IConsumerManagerState<S> {
        return this._state;
    }

    /**
     * Register the consumer with the Grid.
     * @param configuration The configuration to use.
     */
    public async initialise(): Promise<void> {
        await this.loadState();

        this._loggingService.log("consumer-init", "Registering with Grid");

        const response = await this._registrationService.register(
            this._config.id,
            this._config.name,
            "consumer",
            this._state && this._state.channel && this._state.channel.initialRoot,
            this._state && this._state.channel && this._state.channel.sideKey
        );

        this._loggingService.log("consumer-init", `Registered with Grid`);

        this._loggingService.log("consumer-init", `Grid returned mam channel: ${response.root}, ${response.sideKey}`);

        if (!this._state.returnChannel && response.root && response.sideKey) {
            this._loggingService.log("consumer-init", `Opening return channel`);
            this._state.returnChannel = {
                initialRoot: response.root,
                sideKey: response.sideKey
            };

            const returnMamChannel = new MamCommandChannel(this._loadBalancerSettings);
            if (await returnMamChannel.openReadable(this._state.returnChannel)) {
                this._loggingService.log("consumer-init", `Opening return channel success`);
            } else {
                this._loggingService.log("consumer-init", `Opening return channel failed`);
            }
        }

        if (this._state.channel) {
            this._loggingService.log("consumer-init", `Channel Config already exists`);
        } else {
            this._loggingService.log("consumer-init", `Channel Config not found`);
            this._loggingService.log("consumer-init", `Creating Channel`);

            const itemMamChannel = new MamCommandChannel(this._loadBalancerSettings);

            this._state.channel = {};
            await itemMamChannel.openWritable(this._state.channel);

            this._loggingService.log("consumer-init", `Creating Channel Success`);

            this._loggingService.log("consumer-init", `Updating Registration`);
            await this._registrationService.register(
                this._config.id,
                this._config.name,
                "consumer",
                this._state.channel.initialRoot,
                this._state.channel.sideKey
            );
            this._loggingService.log("consumer-init", `Updated Registration`);
        }
        this._loggingService.log("consumer-init", `Registration Complete`);

        await this.saveState();
    }

    /**
     * Unregister the source from the Grid.
     */
    public async closedown(): Promise<void> {
        let sideKey;

        if (this._state && this._state.channel) {
            sideKey = this._state.channel.sideKey;

            this._loggingService.log("consumer-closedown", `Sending Goodbye`);

            const itemMamChannel = new MamCommandChannel(this._loadBalancerSettings);

            await itemMamChannel.closeWritable(this._state.channel);

            this._loggingService.log("consumer-closedown", `Sending Goodbye Complete`);

            this._state.channel = undefined;
        }

        this._loggingService.log("consumer-closedown", `Unregistering from the Grid`);

        await this._registrationService.unregister(this._config.id, sideKey);

        this._loggingService.log("consumer-closedown", `Unregistered from the Grid`);
    }

    /**
     * Call the strategy to produce usage values for the consumer and check payment requests
     * @returns Any new consumer usage commands.
     */
    public async updateStrategy(): Promise<IConsumerUsageCommand[]> {
        const result = await this._strategy.usage(this._config, this._state);
        let updatedState = result.updatedState;

        this._state.unsentCommands = this._state.unsentCommands.concat(result.commands);

        if (this._state.channel && this._state.unsentCommands.length > 0) {
            const mamCommandChannel = new MamCommandChannel(this._loadBalancerSettings);

            this._state.unsentCommands = await mamCommandChannel.sendCommandQueue(
                this._state.channel,
                this._state.unsentCommands);
        }

        if (this._state.returnChannel) {
            const mamChannel = new MamCommandChannel(this._loadBalancerSettings);

            const returnCommands = await mamChannel.receiveCommands(this._state.returnChannel);

            if (returnCommands && returnCommands.length > 0) {
                const paymentRequests: IConsumerPaymentRequestCommand[] = [];
                for (let i = 0; i < returnCommands.length; i++) {
                    if (returnCommands[i].command === "payment-request") {
                        paymentRequests.push(returnCommands[i] as IConsumerPaymentRequestCommand);
                    }
                }
                if (paymentRequests.length > 0) {
                    await this._strategy.paymentRequests(this._config, this._state, paymentRequests);
                    updatedState = true;
                }
            }
        }

        if (updatedState) {
            await this.saveState();
        }

        return result.commands;
    }

    /**
     * Load the state for the consumer.
     * @private
     */
    private async loadState(): Promise<void> {
        const storageConfigService = ServiceFactory.get<IStorageService<IConsumerManagerState<S>>>(
            "consumer-storage-manager-state");

        this._loggingService.log("consumer", `Loading State`);
        this._state = await storageConfigService.get(this._config.id);
        this._loggingService.log("consumer", `Loaded State`);

        this._state = this._state || {
            strategyState: await this._strategy.initState(),
            unsentCommands: []
        };
    }

    /**
     * Store the state for the consumer.
     * @private
     */
    private async saveState(): Promise<void> {
        const storageConfigService = ServiceFactory.get<IStorageService<IConsumerManagerState<S>>>(
            "consumer-storage-manager-state");

        this._loggingService.log("consumer", `Storing State`);
        await storageConfigService.set(this._config.id, this._state);
        this._loggingService.log("consumer", `Storing State Complete`);
    }
}
