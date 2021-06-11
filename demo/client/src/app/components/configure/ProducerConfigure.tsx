import { Button, Fieldset, FormActions, Heading } from "iota-react-components";
import React, { Component, ReactNode } from "react";
import { ProducerConfigureProps } from "./ProducerConfigureProps";
import { ProducerConfigureState } from "./ProducerConfigureState";
import SourceConfigure from "./SourceConfigure";
import SourceList from "./SourceList";

/**
 * Component which allows the producer to be configured.
 */
class ProducerConfigure extends Component<ProducerConfigureProps, ProducerConfigureState> {
    /**
     * Create a new instance of Producer.
     * @param props The props to create the component with.
     */
    constructor(props: ProducerConfigureProps) {
        super(props);

        this.state = {
            name: this.props.item.name,
            sources: props.item.sources.slice(0)
        };
    }

    /**
     * The component was mounted.
     */
    public componentDidMount(): void {
        this.validateData();
    }

    /**
     * Render the component.
     * @returns The node to render.
     */
    public render(): ReactNode {
        return (
            <React.Fragment>
                {!this.state.configureSource && (
                    <React.Fragment>
                        <Heading level={2}>Producer</Heading>
                        <Fieldset>
                            <label>Name</label>
                            <input
                                type="text"
                                placeholder="Name for the producer between 5 and 30 characters"
                                value={this.state.name}
                                onChange={(e) => this.setState({ name: e.target.value }, () => this.validateData())}
                                maxLength={30}
                            />
                        </Fieldset>
                        <br />
                        <hr />
                        <br />
                    </React.Fragment>
                )}
                <SourceList
                    itemName="Source"
                    pluralName="Sources"
                    newInstance={() => ({ id: "", name: "", type: "" })}
                    items={this.state.sources}
                    onChange={(sources) => this.setState({ sources })}
                    configure={(props) => {
                        this.setState({ configureSource: props });
                    }}
                    maxItems={3}
                />
                {!this.state.configureSource && (
                    <React.Fragment>
                        <br />
                        <hr />
                        <br />
                        <FormActions>
                            <Button disabled={!this.state.isValid} onClick={async () => this.ok()}>OK</Button>
                            <Button color="secondary" onClick={async () => this.cancel()}>Cancel</Button>
                        </FormActions>
                    </React.Fragment>
                )}
                {this.state.configureSource && (
                    <SourceConfigure
                        item={this.state.configureSource.item}
                        onChange={(item) => {
                            if (this.state.configureSource) {
                                this.state.configureSource.onChange(item);
                                this.setState({ configureSource: undefined });
                            }
                        }}
                    />
                )}
            </React.Fragment >
        );
    }

    /**
     * Validate the form data.
     */
    private validateData(): void {
        const isValid = this.state.name && this.state.name.trim().length >= 5 && this.state.name.trim().length <= 30 ? true : false;

        this.setState({ isValid });
    }

    /**
     * Confirm the editing.
     */
    private async ok(): Promise<void> {
        const updated = {
            ...this.props.item,
            name: this.state.name,
            sources: this.state.sources
        };

        if (this.props.onChange) {
            this.props.onChange(updated);
        }
    }

    /**
     * Cancel the editing.
     */
    private async cancel(): Promise<void> {
        if (this.props.onChange) {
            this.props.onChange(undefined);
        }
    }
}

export default ProducerConfigure;
