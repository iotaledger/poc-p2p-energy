import schedule from "node-schedule";
import { ISchedule } from "../models/app/ISchedule";
import { ILoggingService } from "../models/services/ILoggingService";

/**
 * Class to help with scheduling.
 */
export class ScheduleHelper {
    /**
     * Build schedules for the app.
     * @param schedules The schedules to build.
     * @param loggingService The logging service.
     */
    public static async build(schedules: ISchedule[], loggingService: ILoggingService): Promise<void> {
        if (schedules) {
            for (let i = 0; i < schedules.length; i++) {
                loggingService.log("scheduler", `Created: ${schedules[i].name} with ${schedules[i].schedule}`);
                const callFunc = async () => {
                    try {
                        await schedules[i].func();
                    } catch (err) {
                        loggingService.error("scheduler", schedules[i].name, err);
                    }
                };
                schedules[i].cancelId = schedule.scheduleJob(schedules[i].schedule, callFunc);
                await callFunc();
            }
        }
    }
}
