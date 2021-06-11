import { ISource } from "../../../models/api/ISource";

export interface GridLiveSourceProps {
    /**
     * The source
     */
    source: ISource;

    /**
     * Is the source selected.
     */
    isSelected: boolean;

    /**
     * The source has been selected callback.
     */
    onSourceSelected(source: ISource, isSelected: boolean): void;
}
