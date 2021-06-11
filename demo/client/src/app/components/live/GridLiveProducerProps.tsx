import { IProducer } from "../../../models/api/IProducer";

export interface GridLiveProducerProps {
    /**
     * The key index.
     */
    idx: number;

    /**
     * The producer
     */
    producer: IProducer;
}
