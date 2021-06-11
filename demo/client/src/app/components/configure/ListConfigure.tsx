import { Button, Heading, Modal, ScrollHelper, Table, TableBody, TableBodyRow, TableBodyRowData, TableHead, TableHeadRow, TableHeadRowHeader } from "iota-react-components";
import { TrytesHelper } from "p2p-energy-common/dist/utils/trytesHelper";
import React, { Component, ReactNode } from "react";
import { IIdItem } from "../../../models/api/IIdItem";
import { ListConfigureProps } from "./ListConfigureProps";
import { ListConfigureState } from "./ListConfigureState";

/**
 * Component which manages a list of items.
 */
class ListConfigure<T extends IIdItem> extends Component<ListConfigureProps<T>, ListConfigureState<T>> {
    /**
     * Create a new instance of ListConfigure.
     * @param props The props to create the component with.
     */
    constructor(props: ListConfigureProps<T>) {
        super(props);

        this.state = {
            items: this.props.items.slice(0),
            configuring: false
        };
    }

    /**
     * The component received an update.
     * @param previousProps The previous properties.
     */
    public componentDidUpdate(previousProps: ListConfigureProps<T>): void {
        if (this.props.items !== previousProps.items) {
            this.setState({
                items: this.props.items.slice(0)
            });
        }
    }

    /**
     * Render the component.
     * @returns The node to render.
     */
    public render(): ReactNode {
        return (
            <React.Fragment>
                {!this.state.configuring && (
                    <React.Fragment>
                        <Heading level={3} id={this.props.pluralName.toLowerCase()}>
                            {this.props.pluralName}
                            &nbsp;
                            {this.state.items.length < this.props.maxItems && (
                                <Button size="small" color="secondary" onClick={() => this.itemAdd()}>Add</Button>
                            )}
                            {this.state.items.length >= this.props.maxItems && (
                                <Button
                                    size="small"
                                    color="secondary"
                                    onClick={() => this.setState({ showMaxDialog: true })}>
                                    Add
                                </Button>
                            )}
                        </Heading>

                        <Table>
                            <TableHead>
                                <TableHeadRow>
                                    <TableHeadRowHeader>{this.props.itemName}</TableHeadRowHeader>
                                    {this.state.items.length > 0 && (
                                        <React.Fragment>
                                            <TableHeadRowHeader>ID</TableHeadRowHeader>
                                            <TableHeadRowHeader align="right">
                                                Actions
                                            </TableHeadRowHeader>
                                        </React.Fragment>
                                    )}
                                </TableHeadRow>
                            </TableHead>
                            <TableBody>
                                {this.state.items.length === 0 && (
                                    <TableBodyRow>
                                        <TableBodyRowData>
                                            There are currently no {this.props.pluralName.toLowerCase()}.
                                        </TableBodyRowData>
                                    </TableBodyRow>
                                )}
                                {this.state.items.map((item, idx) => (
                                    <TableBodyRow key={item.id}>
                                        <TableBodyRowData>{item.name}</TableBodyRowData>
                                        <TableBodyRowData>{item.id}</TableBodyRowData>
                                        <TableBodyRowData align="right">
                                            <div className="small-vertical-margin">
                                                <Button
                                                    size="small"
                                                    color="secondary"
                                                    onClick={() => this.itemConfigure(item)}
                                                >
                                                    Configure
                                                </Button>
                                                <Button
                                                    size="small"
                                                    color="secondary"
                                                    onClick={() => this.itemDelete(item)}
                                                >
                                                    Delete
                                                </Button>
                                            </div>
                                        </TableBodyRowData>
                                    </TableBodyRow>
                                ))}
                            </TableBody>
                        </Table>
                    </React.Fragment>
                )}
                {this.state.deleteItem && (
                    <Modal
                        title="Confirmation"
                        onClose={id => this.itemDeleteConfirmation(id)}
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
                        Are you sure you want to delete {
                            this.props.itemName.toLowerCase()} '{this.state.deleteItem.name}' ?
                    </Modal>
                )}
                {this.state.showMaxDialog && (
                    <Modal
                        title="Information"
                        onClose={() => this.setState({ showMaxDialog: false })}
                        buttons={[
                            {
                                id: "ok",
                                label: "OK"
                            }
                        ]}
                    >
                        This demonstration only allows a maximum of {this.props.maxItems} {
                            this.props.maxItems > 1 ?
                                this.props.pluralName.toLowerCase() : this.props.itemName.toLowerCase()}.
                    </Modal>
                )}
            </React.Fragment>
        );
    }

    /**
     * Add a new item.
     */
    private itemAdd(): void {
        ScrollHelper.scrollRoot();

        this.setState({ configuring: true });
        this.props.configure({ item: this.props.newInstance(), onChange: result => this.itemUpdate(result) });
    }

    /**
     * Configure an item on the list.
     * @param item The item to configure.
     */
    private itemConfigure(item: T): void {
        ScrollHelper.scrollRoot();

        this.setState({ configuring: true });
        this.props.configure({ item, onChange: result => this.itemUpdate(result) });
    }

    /**
     * Delete an item from the list.
     * @param item The item to delete.
     */
    private itemDelete(item: T): void {
        this.setState({ deleteItem: item });
    }

    /**
     * Confirmation of delete a item from the list.
     * @param id The item to configure.
     */
    private itemDeleteConfirmation(id?: string): void {
        if (id === "yes") {
            const items = this.state.items;
            const findItem = this.state.deleteItem;
            if (findItem) {
                items.splice(items.findIndex(c => c.id === findItem.id), 1);
            }

            this.props.onChange(items);

            this.setState({
                items,
                deleteItem: undefined
            });
        } else {
            this.setState({
                deleteItem: undefined
            });
        }
    }

    /**
     * Update an item in the list.
     * @param item The item that was updated.
     */
    private itemUpdate(item?: T): void {
        if (item) {
            const items = this.state.items;
            if (item.id === "") {
                item.id = TrytesHelper.generateHash(27);
                items.push(item);
            } else {
                items.splice(items.findIndex(p => p.id === item.id), 1, item);
            }

            this.props.onChange(items);

            this.setState(
                {
                    configuring: false,
                    items
                },
                () => ScrollHelper.scrollIntoViewBySelector(`#${this.props.pluralName.toLowerCase()}`));
        } else {
            this.setState(
                {
                    configuring: false
                },
                () => ScrollHelper.scrollIntoViewBySelector(`#${this.props.pluralName.toLowerCase()}`));
        }
    }
}

export default ListConfigure;
