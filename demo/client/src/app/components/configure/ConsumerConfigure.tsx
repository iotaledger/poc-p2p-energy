import { Button, Fieldset, FormActions, Heading, Input, Select } from "iota-react-components";
import React, { Component, ReactNode } from "react";
import { ConsumerConfigureProps } from "./ConsumerConfigureProps";
import { ConsumerConfigureState } from "./ConsumerConfigureState";

/**
 * Component which allows the consumer to be configured.
 */
class ConsumerConfigure extends Component<ConsumerConfigureProps, ConsumerConfigureState> {
    /**
     * Create a new instance of Consumer.
     * @param props The props to create the component with.
     */
    constructor(props: ConsumerConfigureProps) {
        super(props);

        this.state = {
            name: this.props.item.name,
            usageType: (this.props.item.extendedProperties || {}).usageType || "random",
            usageValue: (this.props.item.extendedProperties || {}).usageValue || ""
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
                <Heading level={2}>Consumer</Heading>
                <Fieldset>
                    <label>Name</label>
                    <input
                        type="text"
                        placeholder="Name for the consumer between 5 and 30 characters"
                        value={this.state.name}
                        onChange={e => this.setState({ name: e.target.value }, () => this.validateData())}
                        maxLength={30}
                    />
                </Fieldset>
                <Fieldset>
                    <label>Usage Type</label>
                    <Select
                        value={this.state.usageType}
                        onChange={e =>
                            this.setState(
                                { usageType: e.target.value as any },
                                () => this.validateData())
                        }
                    >
                        <option value="random">Random</option>
                        <option value="fixed">Fixed</option>
                    </Select>
                </Fieldset>
                {this.state.usageType === "fixed" && (
                    <Fieldset>
                        <label>Usage Value</label>
                        <Input
                            type="text"
                            value={this.state.usageValue}
                            restrict="float"
                            onChange={e =>
                                this.setState(
                                    { usageValue: e.target.value },
                                    () => this.validateData())
                            }
                        />
                    </Fieldset>
                )}
                <FormActions>
                    <Button disabled={!this.state.isValid} onClick={async () => this.ok()}>OK</Button>
                    <Button color="secondary" onClick={async () => this.cancel()}>Cancel</Button>
                </FormActions>
            </React.Fragment >
        );
    }

    /**
     * Validate the form data.
     */
    private validateData(): void {
        let isValid =
            this.state.name && this.state.name.trim().length >= 5 &&
                this.state.name.trim().length <= 30 ? true : false;

        if (isValid && this.state.usageType === "fixed") {
            isValid = this.state.usageValue.length > 0 && !Number.isNaN(parseFloat(this.state.usageValue));
        }

        this.setState({ isValid });
    }

    /**
     * Confirm the editing.
     */
    private async ok(): Promise<void> {
        const updated = {
            ...this.props.item,
            name: this.state.name,
            extendedProperties: {
                usageType: this.state.usageType,
                usageValue: this.state.usageType === "random" ? undefined : parseFloat(this.state.usageValue)
            }
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

export default ConsumerConfigure;
