import classnames from "classnames";
import { Button } from "iota-react-components";
import { ServiceFactory } from "p2p-energy-common/dist/factories/serviceFactory";
import React, { Component, ReactNode } from "react";
import ChartistGraph from "react-chartist";
import consumer1 from "../../../assets/consumers/consumer1.svg";
import consumer2 from "../../../assets/consumers/consumer2.svg";
import { DemoGridManager } from "../../../services/demoGridManager";
import { TangleExplorerService } from "../../../services/tangleExplorerService";
import "./GridLiveConsumer.scss";
import { GridLiveConsumerProps } from "./GridLiveConsumerProps";
import { GridLiveConsumerState } from "./GridLiveConsumerState";

/**
 * Component which allows the grid to be viewed live.
 */
class GridLiveConsumer extends Component<GridLiveConsumerProps, GridLiveConsumerState> {
    /**
     * The base for timing.
     */
    private static readonly TIME_BASIS: number = 30000;

    /**
     * The consumer images.
     */
    private readonly _consumerImages: any[];

    /**
     * The demo grid manager.
     */
    private readonly _demoGridManager: DemoGridManager;

    /**
     * Tangle explorer service.
     */
    private readonly _tangleExplorerService: TangleExplorerService;

    /**
     * Create a new instance of GridLiveConsumer.
     * @param props The props for the component.
     */
    constructor(props: GridLiveConsumerProps) {
        super(props);

        this._consumerImages = [
            consumer1,
            consumer2
        ];

        this._tangleExplorerService = ServiceFactory.get<TangleExplorerService>("tangle-explorer");
        this._demoGridManager = ServiceFactory.get<DemoGridManager>("demo-grid-manager");

        this.state = {
            isExpanded: false,
            usageTotal: "-----",
            paidBalance: "-----",
            outstandingBalance: "-----",
            lastOutgoingBundle: "",
            firstConsumerValueTime: 0,
            graphLabels: [],
            graphSeries: []
        };
    }

    /**
     * The component mounted.
     */
    public async componentDidMount(): Promise<void> {
        this._demoGridManager.subscribeConsumer("liveConsumer", this.props.consumer.id, (consumerState) => {
            const consumerManagerState = consumerState && consumerState.consumerManagerState;
            const consumerStrategyState = consumerManagerState && consumerManagerState.strategyState;
            const mamChannel = consumerManagerState && consumerManagerState.channel;
            const mamChannelReturn = consumerManagerState && consumerManagerState.returnChannel;

            const usageCommands = (consumerState && consumerState.usageCommands) || [];

            const firstConsumerValueTime = this.state.firstConsumerValueTime ||
                (usageCommands.length > 0 ? usageCommands[0].endTime : 0);

            this.setState(
                {
                    usageTotal: consumerStrategyState && consumerStrategyState.usageTotal !== undefined ?
                        `${Math.floor(consumerStrategyState.usageTotal * 10) / 10} kWh` : "-----",
                    paidBalance: consumerStrategyState && consumerStrategyState.paidBalance !== undefined ?
                        `${consumerStrategyState.paidBalance}i` : "-----",
                    outstandingBalance: consumerStrategyState && consumerStrategyState.outstandingBalance !== undefined ?
                        `${consumerStrategyState.outstandingBalance}i` : "-----",
                    lastOutgoingBundle: consumerStrategyState &&
                        consumerStrategyState.lastOutgoingTransfer ? consumerStrategyState.lastOutgoingTransfer.bundle : "",
                    mamRoot: mamChannel && mamChannel.initialRoot,
                    sideKey: mamChannel && mamChannel.sideKey,
                    mamRootReturn: mamChannelReturn && mamChannelReturn.initialRoot,
                    sideKeyReturn: mamChannelReturn && mamChannelReturn.sideKey,
                    firstConsumerValueTime,
                    graphSeries: usageCommands.map(u => u.usage),
                    graphLabels: usageCommands.map(u => Math.floor((u.endTime - firstConsumerValueTime) / GridLiveConsumer.TIME_BASIS).toString())
                }
            );
        });
    }

    /**
     * The component is going to unmount so tidy up.
     */
    public componentWillUnmount(): void {
        this._demoGridManager.unsubscribeConsumer("liveConsumer", this.props.consumer.id);
    }

    /**
     * Render the component.
     * @returns The node to render.
     */
    public render(): ReactNode {
        return (
            <div className="grid-live-consumer">
                <div className="grid-live-consumer-info-wrapper">
                    <button
                        className={
                            classnames(
                                "grid-live-consumer-btn",
                                { "grid-live-consumer-btn--expanded": this.state.isExpanded }
                            )
                        }
                        onClick={() => this.setState({ isExpanded: !this.state.isExpanded })}
                    >
                        <div className="grid-live-consumer-btn-top">
                            <img src={this._consumerImages[this.props.idx % 2]} alt={this.props.consumer.name} />
                        </div>
                        <div className="grid-live-consumer-btn-bottom">
                            {this.props.consumer.name}
                            <span className={this.state.isExpanded ? "icon-chevron-up" : "icon-chevron-down"} />
                        </div>
                    </button>
                    <div className="grid-live-consumer-info">
                        <div className="grid-live-consumer-info-id">ID: {this.props.consumer.id}</div>
                        <div className="grid-live-consumer-info-data"><span>Usage</span><span>{this.state.usageTotal}</span></div>
                        <div className="grid-live-consumer-info-data"><span>Paid</span><span>{this.state.paidBalance}</span></div>
                        <div className="grid-live-consumer-info-data"><span>Outstanding</span><span>{this.state.outstandingBalance}</span></div>
                        {this.state.lastOutgoingBundle && (
                            <div className="grid-live-consumer-info-data"><span>Confirmed</span><span>
                                <button className="link" onClick={() => this._tangleExplorerService.bundle(this.state.lastOutgoingBundle)}>
                                    {this.state.lastOutgoingBundle.substr(0, 10)}...
                                </button>
                            </span></div>
                        )}
                    </div>
                </div>
                {this.state.isExpanded && (
                    <div
                        className={
                            classnames(
                                "grid-live-consumer-detail",
                                { "grid-live-consumer-detail--expanded": this.state.isExpanded }
                            )}
                    >
                        <br />
                        {this.state.mamRoot && (
                            <Button
                                size="extra-small"
                                color="secondary"
                                onClick={() => this._tangleExplorerService.mam(this.state.mamRoot, "restricted", this.state.sideKey)}
                            >
                                MAM Usage
                            </Button>
                        )}
                        {this.state.mamRootReturn && (
                            <Button
                                size="extra-small"
                                color="secondary"
                                onClick={() => this._tangleExplorerService.mam(this.state.mamRootReturn, "restricted", this.state.sideKeyReturn)}
                            >
                                MAM Billing
                            </Button>
                        )}
                        {this.state.graphSeries.length === 0 && (
                            <p>There is no usage data for this consumer.</p>
                        )}
                        {this.state.graphSeries.length > 0 && (
                            <div className="charts">
                                <ChartistGraph
                                    data={{
                                        labels: this.state.graphLabels,
                                        series: [this.state.graphSeries]
                                    }}
                                    type="Line"
                                />
                            </div>
                        )}
                    </div>
                )}
            </div>
        );
    }
}

export default GridLiveConsumer;
