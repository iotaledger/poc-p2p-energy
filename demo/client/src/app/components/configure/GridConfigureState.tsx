import { IConsumer } from "../../../models/api/IConsumer";
import { IProducer } from "../../../models/api/IProducer";
import { ConsumerConfigureProps } from "./ConsumerConfigureProps";
import { ProducerConfigureProps } from "./ProducerConfigureProps";

export interface GridConfigureState {
    /**
     * The grid name.
     */
    gridName: string;

    /**
     * The grid password.
     */
    password: string;

    /**
     * The grid password for configuring.
     */
    passwordConfigure: string;

    /**
     * The producers to configure.
     */
    producers: IProducer[];

    /**
     * The consumers to configure.
     */
    consumers: IConsumer[];

    /**
     * Is the form data valid.
     */
    isValid?: boolean;

    /**
     * Is the form busy.
     */
    isBusy?: boolean;

    /**
     * Did any operations error.
     */
    isErrored?: boolean;

    /**
     * Is the operation successful.
     */
    isSuccess?: boolean;

    /**
     * Status of form operations.
     */
    status: string;

    /**
     * Do we need a password to configure the grid.
     */
    passwordSupplied?: boolean;

    /**
     * The producer to configure.
     */
    configureProducer?: ProducerConfigureProps;

    /**
     * The consumer to configure.
     */
    configureConsumer?: ConsumerConfigureProps;

    /**
     * The delete modal.
     */
    showDeleteConfirmation: boolean;

    /**
     * Redirect back to main page.
     */
    redirect: boolean;
}
