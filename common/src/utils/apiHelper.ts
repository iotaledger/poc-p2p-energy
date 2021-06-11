/**
 * Class to help with api calls.
 */
export class ApiHelper {
    /**
     * Join params onto command.
     * @param command The command.
     * @param params The params to add.
     * @returns The joined parameters.
     */
    public static joinParams(command: string, params: any[]): string {
        let newCommand = command;
        for (let i = 0; i < params.length; i++) {
            newCommand += `/${encodeURIComponent(params[i])}`;
        }
        return newCommand;
    }

    /**
     * Remove the keys from the object.
     * @param obj The object to remove the keys from.
     * @param keys The keys to remove.
     * @returns The object with keys removed.
     */
    public static removeKeys(obj: any, keys: string[]): any {
        const ret = {};
        const objKeys = Object.keys(obj);
        for (let i = 0; i < objKeys.length; i++) {
            if (keys.indexOf(objKeys[i]) < 0) {
                ret[objKeys[i]] = obj[objKeys[i]];
            }
        }
        return ret;
    }
}
