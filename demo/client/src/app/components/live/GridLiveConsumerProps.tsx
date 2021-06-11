import { IConsumer } from "../../../models/api/IConsumer";

export interface GridLiveConsumerProps {
    /**
     * The key index.
     */
    idx: number;

    /**
     * The consumer
     */
    consumer: IConsumer;
}
