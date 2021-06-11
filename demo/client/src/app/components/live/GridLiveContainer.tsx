import { StatusMessage } from "iota-react-components";
import { ServiceFactory } from "p2p-energy-common/dist/factories/serviceFactory";
import React, { Component, ReactNode } from "react";
import { DemoGridManager } from "../../../services/demoGridManager";
import LoggingView from "../services/LoggingView";
import GridLiveConsumer from "./GridLiveConsumer";
import "./GridLiveContainer.scss";
import { GridLiveContainerProps } from "./GridLiveContainerProps";
import { GridLiveContainerState } from "./GridLiveContainerState";
import GridLiveOverview from "./GridLiveOverview";
import GridLiveProducer from "./GridLiveProducer";

/**
 * Component which allows the grid to be viewed live.
 */
class GridLiveContainer extends Component<GridLiveContainerProps, GridLiveContainerState> {
    /**
     * The demo grid manager.
     */
    private readonly _demoGridManager: DemoGridManager;

    /**
     * The component was unmounted.
     */
    private _unmounted: boolean;

    /**
     * Create a new instance of GridLiveContainer.
     * @param props The props for the component.
     */
    constructor(props: GridLiveContainerProps) {
        super(props);

        this._demoGridManager = ServiceFactory.get<DemoGridManager>("demo-grid-manager");

        this._unmounted = false;

        this.state = {
            gridState: this._demoGridManager.getGridState(),
            isBusy: true,
            isError: false,
            status: `Generating grid '${this.props.grid.name}'`
        };
    }

    /**
     * The component mounted.
     */
    public async componentDidMount(): Promise<void> {
        this._demoGridManager.subscribeGrid("liveContainer", gridState => {
            if (!this._unmounted) {
                this.setState({ gridState });
            }
        });

        try {
            await this._demoGridManager.initialise(this.props.grid, progress => {
                if (!this._unmounted) {
                    this.setState({
                        status: progress
                    });
                }
            });
            if (!this._unmounted) {
                this.setState({
                    isBusy: false,
                    status: ""
                });
            }
        } catch (err) {
            if (!this._unmounted) {
                this.setState({
                    isBusy: false,
                    isError: true,
                    status: `${this.state.status}\nError: ${err.message}`
                });
            }
        }
    }

    /**
     * The component is going to unmount so tidy up.
     */
    public componentWillUnmount(): void {
        this._demoGridManager.closedown();

        this._demoGridManager.unsubscribeGrid("liveContainer");

        this._unmounted = true;
    }

    /**
     * Render the component.
     * @returns The node to render.
     */
    public render(): ReactNode {
        return (
            <div className="grid-live-container">
                <StatusMessage
                    status={this.state.status}
                    color={this.state.isError ? "danger" : "success"}
                    isBusy={this.state.isBusy}
                />

                {!this.state.status && (
                    <React.Fragment>
                        <div className="grid-live-columns">
                            <div className="grid-live-source-producer-column">
                                <div className="grid-live-caption">Producers</div>
                                {this.props.grid.producers.length === 0 && (
                                    <div className="grid-live-producer">
                                        <div>There are no producers configured.</div>
                                    </div>
                                )}
                                {this.props.grid.producers.map((p, idx) => (
                                    <GridLiveProducer key={idx} producer={p} idx={idx} />
                                ))}
                            </div>
                            <div className="grid-live-grid-column">
                                <div className="grid-live-caption">Grid</div>
                                <GridLiveOverview grid={this.props.grid} />
                            </div>

                            <div className="grid-live-consumer-column">
                                <div className="grid-live-caption">Consumers</div>
                                {this.props.grid.consumers.length === 0 && (
                                    <div className="grid-live-producer">
                                        <div>There are no consumers configured.</div>
                                    </div>
                                )}
                                {this.props.grid.consumers.map((c, idx) => (
                                    <GridLiveConsumer key={idx} consumer={c} idx={idx} />
                                ))}
                            </div>
                        </div>

                    </React.Fragment>
                )}

                <LoggingView />

                <br />
                <hr />
                <div>
                    For this demonstration the <strong>Source</strong> and <strong>Consumers</strong>
                    generate values every 30s, so you will not see data immediately.
                     In a real world system the updates would most likely be spaced at even longer intervals.
                    <br /><br />
                    Payment is only requested from <strong>Consumers</strong> on whole kWh, so they will
                    have no outstanding balance until they have accumulated some
                    usage. <strong>Consumers</strong> only pay the grid when they reach multiples of 25i.
                    <br /><br />
                    Once the <strong>Grid</strong> receives payments from the <strong>Consumers</strong>
                    it takes 20% of the payment for its running costs and then distributes
                    the rest to the <strong>Producers</strong> weighted by how much they have contributed
                    to the <strong>Grid</strong>.
                    <br /><br />
                    Payment distribution from the <strong>Grid</strong> to the <strong>Producers</strong>
                    is executed at 40i intervals.
                    <br /><br />
                    All of the payments in this demonstration are made from and to a central wallet, and
                    transactions only appear when they are confirmed. In a real world
                    system each entity would have its own wallet.
                    <br /><br />
                    All of the timing and payment strategies are easily replaceable in the source code provided.
                </div>
                <hr />
                <p>To find out more details on how this was this demo implemented, please read the Blueprint on the docs
                    site <a href="https://docs.iota.org/docs/blueprints/0.1/p2p-energy/overview" target="_blank" rel="noopener noreferrer">P2P Energy Grid Blueprint</a> or
                    view the source code on <a href="https://github.com/iotaledger/poc-p2p-energy" target="_blank" rel="noopener noreferrer">GitHub</a>.
                </p>
            </div>
        );
    }
}

export default GridLiveContainer;
