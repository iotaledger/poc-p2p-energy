import { IConsumer } from "./IConsumer";
import { IProducer } from "./IProducer";

export interface IGrid {
    /**
     * The id of the grid.
     */
    id: string;

    /**
     * The name of the grid.
     */
    name: string;

    /**
     * Password to protect the configuration.
     */
    password?: string;

    /**
     * The list of producers.
     */
    producers: IProducer[];

    /**
     * The list of consumers.
     */
    consumers: IConsumer[];
}
