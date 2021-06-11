export interface GridLiveConsumerState {
    /**
     * The mam root.
     */
    mamRoot?: string;

    /**
     * The mam sideKey.
     */
    sideKey?: string;

    /**
     * The mam root for the return channel.
     */
    mamRootReturn?: string;

    /**
     * The mam sideKey for the return channel.
     */
    sideKeyReturn?: string;

    /**
     * The total usage.
     */
    usageTotal: string;

    /**
     * The paid balance.
     */
    paidBalance: string;

    /**
     * Owed balance.
     */
    outstandingBalance: string;

    /**
     * The hash of the last payment bundle.
     */
    lastOutgoingBundle: string;

    /**
     * Are the details expanded.
     */
    isExpanded: boolean;

    /**
     * The first time we saw a consumer value.
     */
    firstConsumerValueTime: number;

    /**
     * The data labels for the graph.
     */
    graphLabels: string[];

    /**
     * The data series for the graph.
     */
    graphSeries: number[];
}
