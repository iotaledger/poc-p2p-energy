/**
 * Definition of channel configuration.
 */
export interface IMamChannelConfiguration {
    /**
     * The seed used to generate the channel.
     */
    seed?: string;

    /**
     * The side key for channel data.
     */
    sideKey?: string;

    /**
     * The initial root for the channel.
     */
    initialRoot?: string;

    /**
     * The most recent root for the channel.
     */
    mostRecentRoot?: string;

    /**
     * The next root for the channel.
     */
    nextRoot?: string;

    /**
     * The start index for the channel.
     */
    start?: number;
}
