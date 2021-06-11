import { Button } from "iota-react-components";
import { ServiceFactory } from "p2p-energy-common/dist/factories/serviceFactory";
import { CallbackLoggingService } from "p2p-energy-common/dist/services/logging/callbackLoggingService";
import React, { Component, ReactNode } from "react";
import "./LoggingView.scss";
import { LoggingViewState } from "./LoggingViewState";

/**
 * Component which manages a list of consumers.
 */
class LoggingView extends Component<any, LoggingViewState> {
    /**
     * Logging service to display.
     */
    private _callbackLoggingService?: CallbackLoggingService;

    /**
     * Create a new instance of LoggingView.
     * @param props The props for the component.
     */
    constructor(props: any) {
        super(props);

        this.state = {
            entries: [],
            isExpanded: false
        };
    }

    /**
     * The component mounted.
     */
    public async componentDidMount(): Promise<void> {
        this._callbackLoggingService = ServiceFactory.get<CallbackLoggingService>("callback-logging");

        this._callbackLoggingService.addCallback("view", log => {
            let current = this.state.entries;
            current.unshift(log);
            current = current.slice(0, 30);
            this.setState({
                entries: current
            });
        });
    }

    /**
     * The component is going to unmount so tidy up.
     */
    public componentWillUnmount(): void {
        if (this._callbackLoggingService) {
            this._callbackLoggingService.removeCallback("view");
        }
    }

    /**
     * Render the component.
     * @returns The node to render.
     */
    public render(): ReactNode {
        return (
            <div className="logging-view">
                <Button
                    color="secondary"
                    onClick={() => this.setState({ isExpanded: !this.state.isExpanded })}
                >
                    {this.state.isExpanded ? "Hide Log" : "Show Log"}
                </Button>
                <div className={`logging-view--list ${this.state.isExpanded ? "logging-view--list-expanded" : ""}`}>
                    {
                        this.state.isExpanded && this.state.entries.map((entry, idx) =>
                            <div key={idx} className="logging-view--entry">
                                <div className="logging-view--entry-row">
                                    <div>{entry.context.toUpperCase()}</div>
                                    <div>{entry.message}</div>
                                </div>
                                {entry.params && entry.params.length > 0 && (
                                    <div className="logging-view--entry-row">
                                        <div>&nbsp;</div>
                                        <div>
                                            {entry.params && entry.params.map((e, idx2) => (
                                                <div key={idx2}><pre>{JSON.stringify(e, undefined, 2)}</pre></div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )
                    }
                </div>
            </div >
        );
    }
}

export default LoggingView;
