import { ServiceFactory } from "p2p-energy-common/dist/factories/serviceFactory";
import React, { Component, ReactNode } from "react";
import grid from "../../../assets/grid/grid.svg";
import { DemoGridManager } from "../../../services/demoGridManager";
import { TangleExplorerService } from "../../../services/tangleExplorerService";
import "./GridLiveOverview.scss";
import { GridLiveOverviewProps } from "./GridLiveOverviewProps";
import { GridLiveOverviewState } from "./GridLiveOverviewState";

/**
 * Component which allows the grid to be viewed live.
 */
class GridLiveOverview extends Component<GridLiveOverviewProps, GridLiveOverviewState> {
    /**
     * The demo grid manager.
     */
    private readonly _demoGridManager: DemoGridManager;

    /**
     * Tangle explorer service.
     */
    private readonly _tangleExplorerService: TangleExplorerService;

    /**
     * Create a new instance of GridLiveOverview.
     * @param props The props for the component.
     */
    constructor(props: GridLiveOverviewProps) {
        super(props);

        this._demoGridManager = ServiceFactory.get<DemoGridManager>("demo-grid-manager");
        this._tangleExplorerService = ServiceFactory.get<TangleExplorerService>("tangle-explorer");

        this.state = {
            runningCostsTotal: "-----",
            runningCostsReceived: "-----",
            distributionAvailable: "-----",
            producersTotalOutput: "-----",
            producersTotalReceived: "-----",
            producersTotalOwed: "-----",
            consumersTotalUsage: "-----",
            consumersTotalPaid: "-----",
            consumersTotalOutstanding: "-----",
            lastIncomingBundle: "",
            lastOutgoingBundle: ""
        };
    }

    /**
     * The component mounted.
     */
    public async componentDidMount(): Promise<void> {
        this._demoGridManager.subscribeGrid("liveOverview", (gridState) => {
            const gridManagerState = gridState && gridState.gridManagerState;
            const gridStrategyState = gridManagerState && gridManagerState.strategyState;

            let producersTotalOutput = 0;
            let producersTotalReceived = 0;
            let producersTotalOwed = 0;
            let consumersTotalUsage = 0;
            let consumersTotalOutstanding = 0;
            let consumersTotalPaid = 0;

            if (gridStrategyState) {
                for (const producerId in gridStrategyState.producerTotals) {
                    producersTotalOutput += gridStrategyState.producerTotals[producerId].output;
                    producersTotalReceived += gridStrategyState.producerTotals[producerId].received;
                    producersTotalOwed += gridStrategyState.producerTotals[producerId].owed;
                }
                for (const consumerId in gridStrategyState.consumerTotals) {
                    consumersTotalUsage += gridStrategyState.consumerTotals[consumerId].usage;
                    consumersTotalOutstanding += gridStrategyState.consumerTotals[consumerId].outstanding;
                    consumersTotalPaid += gridStrategyState.consumerTotals[consumerId].paid;
                }
            }

            this.setState({
                runningCostsTotal: gridStrategyState && gridStrategyState.runningCostsTotal !== undefined
                    ? `${gridStrategyState.runningCostsTotal}i` : "0i",
                runningCostsReceived: gridStrategyState && gridStrategyState.runningCostsReceived !== undefined
                    ? `${gridStrategyState.runningCostsReceived}i` : "0i",
                distributionAvailable: gridStrategyState && gridStrategyState.distributionAvailable !== undefined
                    ? `${gridStrategyState.distributionAvailable}i` : "0i",
                producersTotalOutput: `${Math.ceil(producersTotalOutput)} kWh`,
                producersTotalReceived: `${producersTotalReceived}i`,
                producersTotalOwed: `${producersTotalOwed}i`,
                consumersTotalUsage: `${Math.floor(consumersTotalUsage * 10) / 10} kWh`,
                consumersTotalOutstanding: `${consumersTotalOutstanding}i`,
                consumersTotalPaid: `${consumersTotalPaid}i`,
                lastIncomingBundle: gridStrategyState && gridStrategyState.lastIncomingTransfer
                    ? gridStrategyState.lastIncomingTransfer.bundle : "",
                lastOutgoingBundle: gridStrategyState && gridStrategyState.lastOutgoingTransfer
                    ? gridStrategyState.lastOutgoingTransfer.bundle : ""
            });
        });
    }

    /**
     * The component is going to unmount so tidy up.
     */
    public componentWillUnmount(): void {
        this._demoGridManager.unsubscribeGrid("liveOverview");
    }

    /**
     * Render the component.
     * @returns The node to render.
     */
    public render(): ReactNode {
        return (
            <div className="grid-live-grid">
                <div className="grid-live-caption">
                    {this.props.grid.name}
                    <div className="grid-live-caption-id">ID: {this.props.grid.id}</div>
                </div>
                <img src={grid} alt="Grid" />
                <div className="grid-live-grid-sub-title">Grid</div>

                <div className="grid-live-grid-data">
                    <span className="grid-live-grid-data-caption wide">Accumulated Running Costs</span>
                    <span className="positive">{this.state.runningCostsTotal}</span>
                </div>
                <div className="grid-live-grid-data">
                    <span className="grid-live-grid-data-caption wide">Running Costs Received</span>
                    <span className="positive">{this.state.runningCostsReceived}</span>
                </div>
                <div className="grid-live-grid-data">
                    <span className="grid-live-grid-data-caption wide">Distribution Available<br/>for Producers</span>
                    <span className="positive">{this.state.distributionAvailable}</span>
                </div>

                <br />

                <div className="grid-live-grid-sub-title">
                    Grid &lt;&gt; Producers
                    <span className="grid-live-grid-sub-title-value">
                        [{this.props.grid.producers.length}]
                    </span>
                </div>
                <div className="grid-live-grid-data">
                    <span className="grid-live-grid-data-caption">Total Producer Output</span>
                    <span>{this.state.producersTotalOutput}</span>
                </div>
                <div className="grid-live-grid-data">
                    <span className="grid-live-grid-data-caption">Payments Distributed<br/>to Producers</span>
                    <span className="positive">{this.state.producersTotalReceived}</span>
                </div>
                <div className="grid-live-grid-data">
                    <span className="grid-live-grid-data-caption">Distributions Owed<br/>to Producers</span>
                    <span className="negative">{this.state.producersTotalOwed}</span>
                </div>

                <br />
                <div className="grid-live-grid-sub-title">
                    Grid &lt;&gt; Consumers
                    <span className="grid-live-grid-sub-title-value">
                        [{this.props.grid.consumers.length}]
                    </span>
                </div>
                <div className="grid-live-grid-data">
                    <div className="grid-live-grid-data-caption">Total Consumer Usage</div>
                    <div>{this.state.consumersTotalUsage}</div>
                </div>
                <div className="grid-live-grid-data">
                    <div className="grid-live-grid-data-caption">Confirmed Payments<br/>from Consumer</div>
                    <div className="positive">{this.state.consumersTotalPaid}</div>
                </div>
                <div className="grid-live-grid-data">
                    <div className="grid-live-grid-data-caption">Requested Payments<br/>from Consumer</div>
                    <div className="negative">{this.state.consumersTotalOutstanding}</div>
                </div>

                {(this.state.lastIncomingBundle || this.state.lastOutgoingBundle) && (
                    <React.Fragment>
                        <br />
                        <div className="grid-live-grid-sub-title">
                            Transactions
                        </div>
                    </React.Fragment>
                )}

                {this.state.lastIncomingBundle && (
                    <div className="grid-live-grid-data">
                        <span className="grid-live-grid-data-caption">Last Incoming</span>
                        <button className="link" onClick={() => this._tangleExplorerService.bundle(this.state.lastIncomingBundle)}>
                            {this.state.lastIncomingBundle.substr(0, 10)}...
                        </button>
                    </div>
                )}
                {this.state.lastOutgoingBundle && (
                    <div className="grid-live-grid-data">
                        <span className="grid-live-grid-data-caption">Last Outgoing</span>
                        <button className="link" onClick={() => this._tangleExplorerService.bundle(this.state.lastOutgoingBundle)}>
                            {this.state.lastOutgoingBundle.substr(0, 10)}...
                        </button>
                    </div>
                )}
            </div >
        );
    }
}

export default GridLiveOverview;
