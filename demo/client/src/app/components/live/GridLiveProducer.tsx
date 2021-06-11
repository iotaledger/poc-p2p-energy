import classnames from "classnames";
import { Button } from "iota-react-components";
import { ServiceFactory } from "p2p-energy-common/dist/factories/serviceFactory";
import React, { Component, ReactNode } from "react";
import ChartistGraph from "react-chartist";
import producer1 from "../../../assets/producers/producer1.svg";
import producer2 from "../../../assets/producers/producer2.svg";
import producer3 from "../../../assets/producers/producer3.svg";
import { ISource } from "../../../models/api/ISource";
import { DemoGridManager } from "../../../services/demoGridManager";
import { TangleExplorerService } from "../../../services/tangleExplorerService";
import "./GridLiveProducer.scss";
import { GridLiveProducerProps } from "./GridLiveProducerProps";
import { GridLiveProducerState } from "./GridLiveProducerState";
import GridLiveSource from "./GridLiveSource";

/**
 * Component which allows the grid to be viewed live.
 */
class GridLiveProducer extends Component<GridLiveProducerProps, GridLiveProducerState> {
    /**
     * The base for timing.
     */
    private static readonly TIME_BASIS: number = 30000;

    /**
     * The producer images.
     */
    private readonly _producerImages: any[];

    /**
     * The demo grid manager.
     */
    private readonly _demoGridManager: DemoGridManager;

    /**
     * Tangle explorer service.
     */
    private readonly _tangleExplorerService: TangleExplorerService;

    /**
     * Create a new instance of GridLiveProducer.
     * @param props The props for the component.
     */
    constructor(props: GridLiveProducerProps) {
        super(props);

        this._producerImages = [
            producer1,
            producer2,
            producer3
        ];

        this._tangleExplorerService = ServiceFactory.get<TangleExplorerService>("tangle-explorer");
        this._demoGridManager = ServiceFactory.get<DemoGridManager>("demo-grid-manager");

        this.state = {
            isExpanded: false,
            selectedSources: {},
            firstProducerValueTime: 0,
            producerGraphLabels: [],
            producerGraphSeries: [],
            firstSourceValueTime: 0,
            sourceGraphLabels: [],
            sourceGraphSeries: [],
            outputTotal: "-----",
            receivedBalance: "-----",
            lastIncomingBundle: ""
        };
    }

    /**
     * The component mounted.
     */
    public async componentDidMount(): Promise<void> {
        this._demoGridManager.subscribeProducer("liveProducer", this.props.producer.id, producerState => {
            const mamChannel = producerState &&
                producerState.producerManagerState &&
                producerState.producerManagerState.channel;
            const producerManagerState = producerState && producerState.producerManagerState;
            const producerStrategyState = producerManagerState && producerManagerState.strategyState;

            const outputCommands = (producerState && producerState.outputCommands) || [];

            const firstProducerTime = this.state.firstProducerValueTime ||
                (outputCommands.length > 0 ? outputCommands[0].endTime : 0);

            const producerGraphLabels: string[] = [];
            for (let i = 0; i < outputCommands.length; i++) {
                // We take off 3 because we know the producer basic strategy delays 15s
                // before combining source values
                const labelValue =
                    Math.floor((outputCommands[i].endTime - firstProducerTime) / GridLiveProducer.TIME_BASIS) - 3;
                producerGraphLabels.push(labelValue < 0 ? "n/a" : labelValue.toString());
            }

            this.setState({
                outputTotal: producerStrategyState && producerStrategyState.outputTotal !== undefined
                    ? `${Math.ceil(producerStrategyState.outputTotal)} kWh` : "-----",
                receivedBalance: producerStrategyState && producerStrategyState.receivedBalance !== undefined
                    ? `${producerStrategyState.receivedBalance}i` : "-----",
                lastIncomingBundle: producerStrategyState && producerStrategyState.lastIncomingTransfer ?
                    producerStrategyState.lastIncomingTransfer.bundle : "",
                mamRoot: mamChannel && mamChannel.initialRoot,
                sideKey: mamChannel && mamChannel.sideKey,
                firstProducerValueTime: firstProducerTime,
                producerGraphSeries: outputCommands.map(o => o.output),
                producerGraphLabels
            });
        });
        this.selectAllSources(true);
    }

    /**
     * The component is going to unmount so tidy up.
     */
    public componentWillUnmount(): void {
        this._demoGridManager.unsubscribeProducer("liveProducer", this.props.producer.id);
    }

    /**
     * Render the component.
     * @returns The node to render.
     */
    public render(): ReactNode {
        return (
            <div className="grid-live-producer">
                <div className="grid-live-producer-info-wrapper">
                    <button
                        className={
                            classnames(
                                "grid-live-producer-btn",
                                { "grid-live-producer-btn--expanded": this.state.isExpanded }
                            )
                        }
                        onClick={() => this.setState({ isExpanded: !this.state.isExpanded })}
                    >
                        <div className="grid-live-producer-btn-top">
                            <img src={this._producerImages[this.props.idx % 3]} alt={this.props.producer.name} />
                        </div>
                        <div className="grid-live-producer-btn-bottom">
                            {this.props.producer.name}
                            <span className={this.state.isExpanded ? "icon-chevron-up" : "icon-chevron-down"} />
                        </div>
                    </button>
                    <div className="grid-live-producer-info">
                        <div className="grid-live-producer-info-id">ID: {this.props.producer.id}</div>
                        <div className="grid-live-producer-info-data">
                            <span>Output</span><span>{this.state.outputTotal}</span>
                        </div>
                        <div className="grid-live-producer-info-data">
                            <span>Received</span><span>{this.state.receivedBalance}</span>
                        </div>
                        {this.state.lastIncomingBundle && (
                            <div className="grid-live-producer-info-data">
                                <span>Confirmed</span>
                                <span>
                                    <button
                                        className="link"
                                        onClick={() =>
                                            this._tangleExplorerService.bundle(this.state.lastIncomingBundle)}>
                                        {this.state.lastIncomingBundle.substr(0, 10)}...
                                    </button>
                                </span>
                            </div>
                        )}
                    </div>
                </div>
                {this.state.isExpanded && (
                    <div
                        className={
                            classnames(
                                "grid-live-producer-detail",
                                { "grid-live-producer-detail--expanded": this.state.isExpanded }
                            )}
                    >
                        <div className="grid-live-producer-sub-title">
                            Power Output
                            {this.state.mamRoot && (
                                <Button
                                    size="extra-small"
                                    color="secondary"
                                    onClick={
                                        () => this._tangleExplorerService.mam(
                                            this.state.mamRoot,
                                            "restricted",
                                            this.state.sideKey)}
                                >
                                    MAM Output
                                </Button>
                            )}
                        </div>
                        {this.state.producerGraphSeries.length === 0 && (
                            <div>There is no combined power data for the producer.
                                <br />
                                The graph lags behind the sources, as it takes time to gather the data.
                            </div>
                        )}
                        {this.state.producerGraphSeries.length > 0 && (
                            <div className="charts">
                                <ChartistGraph
                                    data={{
                                        labels: this.state.producerGraphLabels,
                                        series: [this.state.producerGraphSeries]
                                    }}
                                    type="Line"
                                />
                            </div>
                        )}
                        <hr />
                        <div className="grid-live-producer-sub-title">
                            Sources
                            {this.props.producer.sources.length > 0 && (
                                <React.Fragment>
                                    <Button
                                        size="extra-small"
                                        color="secondary"
                                        onClick={() => this.selectAllSources(true)}
                                    >
                                        Select All
                                    </Button>
                                    <Button
                                        size="extra-small"
                                        color="secondary"
                                        onClick={() => this.selectAllSources(false)}
                                    >
                                        Clear All
                                    </Button>
                                    <div className="grid-live-producer-sub-title-minor">
                                        Select a source to add its output to the power graph.
                                    </div>
                                </React.Fragment>
                            )}
                        </div>
                        <div className="grid-live-sources">
                            {this.props.producer.sources.length === 0 && (
                                <div>Please configure some sources for this producer.</div>
                            )}
                            {this.props.producer.sources.map((s, idx2) => (
                                <GridLiveSource
                                    key={idx2}
                                    source={s}
                                    isSelected={this.state.selectedSources[s.id] !== undefined}
                                    onSourceSelected={(source, isSelected) =>
                                        this.handleSelectSource(source, isSelected)}
                                />
                            ))}
                        </div>
                        {this.props.producer.sources.length > 0 &&
                            Object.keys(this.state.selectedSources).length === 0 && (
                                <div>Please select some sources to view their output.</div>
                            )}
                        {Object.keys(this.state.selectedSources).length > 0 &&
                            this.state.sourceGraphSeries.length === 0 && (
                                <div>There is no power data for the selected sources.</div>
                            )}
                        {this.state.sourceGraphSeries.length > 0 && (
                            <div className="charts">
                                <ChartistGraph
                                    data={{
                                        labels: this.state.sourceGraphLabels,
                                        series: this.state.sourceGraphSeries
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

    /**
     * Select or unselect all the sources.
     * @param isSelected Is the source selected.
     */
    private selectAllSources(isSelected: boolean): void {
        for (let i = 0; i < this.props.producer.sources.length; i++) {
            this.handleSelectSource(this.props.producer.sources[i], isSelected);
        }
    }

    /**
     * A source has been selected.
     * @param source The source that was selected.
     * @param isSelected Is the source selected.
     */
    private handleSelectSource(source: ISource, isSelected: boolean): void {
        if (isSelected && !this.state.selectedSources[source.id]) {
            this._demoGridManager.subscribeSource("liveProducer", source.id, sourceState => {
                if (sourceState) {
                    const newSelected = this.state.selectedSources;
                    newSelected[source.id] = sourceState;
                    this.setState({ selectedSources: newSelected }, () => this.calculateGraph());
                }
            });
        } else if (!isSelected && this.state.selectedSources[source.id]) {
            this._demoGridManager.unsubscribeSource("liveProducer", source.id);
            delete this.state.selectedSources[source.id];
            this.setState({ selectedSources: this.state.selectedSources }, () => this.calculateGraph());
        }
    }

    /**
     * Calculate the graph data.
     */
    private calculateGraph(): void {
        const graphLabels: string[] = [];
        const graphSeries: number[][] = [];
        let firstSourceValueTime = this.state.firstSourceValueTime;

        // First find the newest index
        let newestTime = -1;
        for (const sourceId in this.state.selectedSources) {
            if (this.state.selectedSources[sourceId].outputCommands.length > 0) {
                if (firstSourceValueTime === 0) {
                    firstSourceValueTime = this.state.selectedSources[sourceId].outputCommands[0].endTime;
                }
                if (this.state.selectedSources[sourceId]
                    .outputCommands[this.state.selectedSources[sourceId].outputCommands.length - 1].endTime
                    > newestTime) {
                    newestTime = this.state.selectedSources[sourceId]
                        .outputCommands[this.state.selectedSources[sourceId].outputCommands.length - 1].endTime;
                }
            }
        }

        if (newestTime > 0) {
            const lastTime = Math.floor((newestTime - firstSourceValueTime) / GridLiveProducer.TIME_BASIS);
            const sourceKeys = Object.keys(this.state.selectedSources);

            for (let i = 0; i < 10; i++) {
                const thisTime = lastTime - 10 + i + 1;
                if (thisTime >= 0) {
                    graphLabels.push(thisTime.toString());

                    // Now for each source find a corresponding value from the output
                    for (let s = 0; s < sourceKeys.length; s++) {
                        const found = this.state.selectedSources[sourceKeys[s]]
                            .outputCommands
                            .find(o =>
                                Math.floor((o.endTime - firstSourceValueTime) / GridLiveProducer.TIME_BASIS)
                                === thisTime);
                        graphSeries[s] = graphSeries[s] || [];
                        graphSeries[s].push(found ? found.output : 0);
                    }
                }
            }
        }
        this.setState({ sourceGraphSeries: graphSeries, sourceGraphLabels: graphLabels, firstSourceValueTime });
    }
}

export default GridLiveProducer;
