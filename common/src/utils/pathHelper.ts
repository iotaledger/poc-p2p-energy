/**
 * Helper functions for using with paths.
 */
export class PathHelper {
    /**
     * Join the path elements.
     * @param container The top level container.
     * @param context The folder context.
     * @param id The item id.
     * @returns The combined path.
     */
    public static join(container: string, context?: string, id?: string): string {
        let path = `${container}/`;
        if (context) {
            path += `${context}/`;
        }
        if (id) {
            path += id;
        }
        return path;
    }
}
