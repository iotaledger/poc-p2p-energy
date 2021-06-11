import { Button, Fieldset, Form, FormActions, FormStatus, Heading, Modal } from "iota-react-components";
import { ServiceFactory } from "p2p-energy-common/dist/factories/serviceFactory";
import { IStorageService } from "p2p-energy-common/dist/models/services/IStorageService";
import React, { Component, ReactNode } from "react";
import { Redirect } from "react-router-dom";
import { IConfiguration } from "../../../models/config/IConfiguration";
import { IAppState } from "../../../models/IAppState";
import { ConfigurationService } from "../../../services/configurationService";
import { DemoApiClient } from "../../../services/demoApiClient";
import ConsumerConfigure from "./ConsumerConfigure";
import ConsumerList from "./ConsumerList";
import { GridConfigureProps } from "./GridConfigureProps";
import { GridConfigureState } from "./GridConfigureState";
import ProducerConfigure from "./ProducerConfigure";
import ProducerList from "./ProducerList";

/**
 * Component which allows the grid to be configured.
 */
class GridConfigure extends Component<GridConfigureProps, GridConfigureState> {
    /**
     * The api client.
     */
    private readonly _apiClient: DemoApiClient;

    /**
     * Access local storage in the browser.
     */
    private readonly _appStateStorageService: IStorageService<IAppState>;

    /**
     * The component was unmounted.
     */
    private _unmounted: boolean;

    /**
     * Create a new instance of Grid.
     * @param props The props to create the component with.
     */
    constructor(props: GridConfigureProps) {
        super(props);
        this._appStateStorageService = ServiceFactory.get<IStorageService<IAppState>>("app-state-storage");

        this._unmounted = false;

        const config = ServiceFactory.get<ConfigurationService<IConfiguration>>("configuration").get();
        this._apiClient = new DemoApiClient(config.apiEndpoint);

        this.state = {
            gridName: this.props.grid.name,
            password: "",
            passwordConfigure: "",
            status: "",
            producers: props.grid.producers.slice(0),
            consumers: props.grid.consumers.slice(0),
            passwordSupplied: props.grid.password ? false : true,
            showDeleteConfirmation: false,
            redirect: false
        };
    }

    /**
     * The component was mounted.
     */
    public componentDidMount(): void {
        this.validateData();
    }

    /**
     * The component will unmount from the dom.
     */
    public componentWillUnmount(): void {
        this._unmounted = true;
    }

    /**
     * Render the component.
     * @returns The node to render.
     */
    public render(): ReactNode {
        if (this.state.redirect) {
            return (<Redirect to="/grid" />);
        }

        return (
            <Form>
                {!this.state.configureConsumer && !this.state.configureProducer && (
                    <React.Fragment>
                        {!this.state.passwordSupplied && (
                            <React.Fragment>
                                <p>The grid '{
                                    this.props.grid.name
                                }' is password protected, please enter the password configure it.</p>
                                <Fieldset>
                                    <label>Password</label>
                                    <input
                                        type="password"
                                        placeholder="Enter the password for the grid"
                                        value={this.state.passwordConfigure}
                                        onChange={e => this.setState({ passwordConfigure: e.target.value })}
                                        readOnly={this.state.isBusy}
                                    />
                                </Fieldset>
                                <FormActions>
                                    <Button
                                        disabled={!this.state.isValid || this.state.isBusy}
                                        onClick={async () => this.checkPassword()}>Continue</Button>
                                </FormActions>
                                <FormStatus
                                    message={this.state.status}
                                    isBusy={this.state.isBusy}
                                    isError={this.state.isErrored}
                                    isSuccess={this.state.isSuccess} />
                            </React.Fragment>
                        )}
                    </React.Fragment>
                )}
                {this.state.passwordSupplied && (
                    <React.Fragment>
                        {!this.state.configureConsumer && !this.state.configureProducer && (
                            <React.Fragment>
                                <Heading level={3}>Grid</Heading>
                                <Fieldset>
                                    <label>Name</label>
                                    <input
                                        type="text"
                                        placeholder="Name for the grid between 5 and 30 characters"
                                        value={this.state.gridName}
                                        onChange={e => this.setState(
                                            { gridName: e.target.value }, () => this.validateData())}
                                        readOnly={this.state.isBusy}
                                        maxLength={30}
                                    />
                                </Fieldset>
                                <Fieldset>
                                    <label>Password</label>
                                    <input
                                        type="password"
                                        placeholder="Leave password blank to have no password"
                                        value={this.state.password}
                                        onChange={e => this.setState(
                                            { password: e.target.value }, () => this.validateData())}
                                        readOnly={this.state.isBusy}
                                    />
                                </Fieldset>
                                <br />
                                <hr />
                                <br />
                            </React.Fragment>
                        )}
                        {!this.state.configureConsumer && (
                            <ProducerList
                                itemName="Producer"
                                pluralName="Producers"
                                newInstance={() => ({ id: "", name: "", sources: [] })}
                                items={this.state.producers}
                                onChange={producers => this.setState({ producers })}
                                configure={props => {
                                    this.setState({ configureProducer: props });
                                }}
                                maxItems={1}
                            />
                        )}
                        {!this.state.configureConsumer && !this.state.configureProducer && (
                            <React.Fragment>
                                <br />
                                <hr />
                                <br />
                            </React.Fragment>
                        )}
                        {!this.state.configureProducer && (
                            <ConsumerList
                                itemName="Consumer"
                                pluralName="Consumers"
                                newInstance={() => ({ id: "", name: "" })}
                                items={this.state.consumers}
                                onChange={consumers => this.setState({ consumers })}
                                configure={props => {
                                    this.setState({ configureConsumer: props });
                                }}
                                maxItems={2}
                            />
                        )}
                        {!this.state.configureConsumer && !this.state.configureProducer && (
                            <React.Fragment>
                                <br />
                                <hr />
                                <br />
                                <FormActions>
                                    <Button
                                        disabled={!this.state.isValid || this.state.isBusy}
                                        onClick={async () => this.gridSave()}>Save</Button>
                                    <Button
                                        disabled={this.state.isBusy}
                                        color="secondary"
                                        onClick={() => this.setState({ redirect: true })}>Cancel</Button>
                                    <Button
                                        disabled={this.state.isBusy}
                                        color="secondary"
                                        onClick={async () => this.gridDelete()}>Delete</Button>
                                </FormActions>
                                <FormStatus
                                    message={this.state.status}
                                    isBusy={this.state.isBusy}
                                    isError={this.state.isErrored}
                                    isSuccess={this.state.isSuccess} />
                            </React.Fragment>
                        )}
                    </React.Fragment>
                )}
                {this.state.configureProducer && (
                    <ProducerConfigure
                        item={this.state.configureProducer.item}
                        onChange={item => {
                            if (this.state.configureProducer) {
                                this.state.configureProducer.onChange(item);
                                this.setState({ configureProducer: undefined });
                            }
                        }}
                    />
                )}
                {this.state.configureConsumer && (
                    <ConsumerConfigure
                        item={this.state.configureConsumer.item}
                        onChange={item => {
                            if (this.state.configureConsumer) {
                                this.state.configureConsumer.onChange(item);
                                this.setState({ configureConsumer: undefined });
                            }
                        }}
                    />
                )}
                {this.state.showDeleteConfirmation && (
                    <Modal
                        title="Confirmation"
                        onClose={id => this.gridDeleteConfirmation(id)}
                        buttons={[
                            {
                                id: "yes",
                                label: "Yes"
                            },
                            {
                                id: "no",
                                label: "No"
                            }
                        ]}
                    >
                        Are you sure you want to delete the grid '{this.state.gridName}' ?
                    </Modal>
                )}
            </Form>
        );
    }

    /**
     * Validate the form data.
     */
    private validateData(): void {
        const isValid =
            this.state.gridName && this.state.gridName.trim().length >= 5 &&
                this.state.gridName.trim().length <= 30 ? true : false;

        this.setState({ isValid });
    }

    /**
     * Check the password for the grid is valid.
     */
    private async checkPassword(): Promise<void> {
        this.setState(
            {
                isBusy: true,
                status: "Checking password, please wait...",
                isErrored: false,
                isSuccess: false
            },
            async () => {
                const response = await this._apiClient.gridPasswordCheck({
                    name: this.props.grid.name,
                    password: this.state.passwordConfigure
                });

                this.setState({
                    isBusy: false,
                    status: response.success ? "" : response.message,
                    isErrored: !response.success,
                    isSuccess: response.success,
                    passwordSupplied: response.success,
                    password: this.state.passwordConfigure
                });
            });
    }

    /**
     * Create a grid using the api.
     */
    private async gridSave(): Promise<void> {
        this.setState(
            {
                isBusy: true,
                status: "Saving Grid, please wait...",
                isErrored: false,
                isSuccess: false
            },
            async () => {
                const updatedGrid = {
                    id: this.props.grid.id,
                    name: this.state.gridName || "",
                    password: this.state.password || "",
                    producers: this.state.producers,
                    consumers: this.state.consumers
                };

                const response = await this._apiClient.gridUpdate({
                    name: this.props.grid.name,
                    password: this.state.passwordConfigure,
                    grid: updatedGrid
                });

                if (response.success) {
                    await this._appStateStorageService.set("default", { gridName: this.state.gridName });

                    if (this.props.onChange) {
                        this.props.onChange(updatedGrid);
                    }

                    this.setState({
                        isBusy: false,
                        status: response.message,
                        isErrored: false,
                        isSuccess: true,
                        passwordConfigure: response.password || ""
                    });

                    setTimeout(
                        () => {
                            if (!this._unmounted) {
                                this.setState({ status: "" });
                            }
                        },
                        3000);
                } else {
                    this.setState({
                        isBusy: false,
                        status: response.message,
                        isErrored: true,
                        isSuccess: false
                    });
                }
            });
    }

    /**
     * Delete a grid with confirmation.
     */
    private async gridDelete(): Promise<void> {
        this.setState({
            showDeleteConfirmation: true
        });
    }

    /**
     * Delete a grid using the api.
     * @param id The modal result.
     */
    private async gridDeleteConfirmation(id?: string): Promise<void> {
        this.setState(
            {
                showDeleteConfirmation: false
            },
            () => {
                if (id === "yes") {
                    this.setState(
                        {
                            isBusy: true,
                            status: "Deleting Grid, please wait...",
                            isErrored: false,
                            isSuccess: false
                        },
                        async () => {
                            const response = await this._apiClient.gridDelete({
                                name: this.props.grid.name,
                                password: this.state.passwordConfigure
                            });

                            if (response.success) {
                                await this._appStateStorageService.remove("default");

                                this.setState({
                                    isBusy: false,
                                    status: response.message,
                                    isErrored: false,
                                    isSuccess: true,
                                    redirect: true
                                });
                            } else {
                                this.setState({
                                    isBusy: false,
                                    status: response.message,
                                    isErrored: true,
                                    isSuccess: false
                                });
                            }
                        });
                }
            });
    }
}

export default GridConfigure;
