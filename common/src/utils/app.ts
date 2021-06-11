import bodyParser from "body-parser";
import cors from "cors";
import express, { Application } from "express";
import path from "path";
import { IDataResponse } from "../models/api/IDataResponse";
import { IRoute } from "../models/app/IRoute";
import { ILoggingService } from "../models/services/ILoggingService";

/**
 * Class to help with expressjs routing.
 */
export class App<T extends {
    /**
     * Allowed domains.
     */
    allowedDomains: string[];
}> {
    /**
     * The default port to use of not specified in env.
     */
    private readonly _defaultPort: number;

    /**
     * Logging service for output.
     */
    private readonly _loggingService: ILoggingService;

    /**
     * The working directory for the app.
     */
    private readonly _workingDirectory: string;

    /**
     * Create a new instance of App.
     * @param defaultPort The default port.
     * @param loggingService The logging service for output.
     * @param workingDirectory The working directory for the app.
     */
    constructor(defaultPort: number, loggingService: ILoggingService, workingDirectory: string) {
        this._defaultPort = defaultPort;
        this._loggingService = loggingService;
        this._workingDirectory = workingDirectory;
    }

    /**
     * Build the application from the routes and the configuration.
     * @param routes The routes to build the application with.
     * @param onComplete Callback called when app is successfully built.
     * @param loggingService Service to handle any logging.
     * @returns The express js application.
     */
    public async build(
        routes: IRoute<T>[],
        onComplete?: (app: Application, config: T, port: number) => Promise<void>
    ): Promise<Application> {
        // tslint:disable:no-var-requires no-require-imports non-literal-require
        const packageJson = require(path.join(this._workingDirectory, "../package.json"));
        const configId = process.env.CONFIG_ID || "local";
        const config: T = require(path.join(this._workingDirectory, `./data/config.${configId}.json`));

        const app: Application = express();

        const corsConfig = {
            origin: config.allowedDomains && config.allowedDomains.length > 0 ? config.allowedDomains : "*",
            methods: ["GET", "POST", "OPTIONS", "PUT", "PATCH", "DELETE"],
            allowedHeaders: ["content-type", "authorization"]
        };

        app.use(cors(corsConfig));

        app.use(bodyParser.json({ limit: "10mb" }));
        app.use(bodyParser.urlencoded({ limit: "10mb", extended: true }));
        app.use(bodyParser.json());

        app.use((req, res, next) => {
            res.setHeader("Access-Control-Allow-Origin", `*`);
            res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, PATCH, DELETE");
            res.setHeader("Access-Control-Allow-Headers", "content-type");

            next();
        });

        routes.unshift(
            {
                path: "/",
                method: "get",
                inline: async () => ({ name: packageJson.name, version: packageJson.version })
            }
        );

        this.buildRoutes(config, app, routes);

        const port = process.env.PORT ? parseInt(process.env.PORT, 10) : this._defaultPort;
        const server = app.listen(port, async () => {
            this._loggingService.log("app", `Started API Server on port ${port}`);
            this._loggingService.log("app", `Version v${packageJson.version}`);
            this._loggingService.log("app", `Running Config '${configId}'`);

            try {
                if (onComplete) {
                    await onComplete(app, config, port);
                }
            } catch (err) {
                this._loggingService.error("app", `Failed during startup`, err);
                server.close();
            }
        });

        return app;
    }

    /**
     * Build routes and connect them to express js.
     * @param config The configuration.
     * @param expressApp The expressjs app.
     * @param routes The routes.
     */
    public buildRoutes(config: T, expressApp: Application, routes: IRoute<T>[]): void {
        for (let i = 0; i < routes.length; i++) {
            expressApp[routes[i].method](routes[i].path, async (req, res) => {
                let response;
                const start = Date.now();
                try {
                    let params = { ...req.params, ...req.query };
                    let body;
                    if (routes[i].dataBody) {
                        body = req.body;
                    } else {
                        params = { ...params, ...req.query, ...req.body };
                    }

                    const filteredParams = {};
                    const keys = Object.keys(params);
                    for (let k = 0; k < keys.length; k++) {
                        if (keys[k].indexOf("pass") < 0) {
                            filteredParams[keys[k]] = params[keys[k]];
                        } else {
                            filteredParams[keys[k]] = "*************";
                        }
                    }

                    this._loggingService.log(
                        "rest",
                        `${routes[i].method.toUpperCase()} ${routes[i].path}`,
                        filteredParams
                    );

                    if (routes[i].func) {
                        const loadedModule = this.loadModule("routes", routes[i].folder, routes[i].func);
                        response = await loadedModule[routes[i].func](config, params, body);
                    } else if (routes[i].inline) {
                        response = await routes[i].inline(config, params, body);
                    }
                } catch (err) {
                    response = { success: false, message: err.message };
                }
                this._loggingService.log("rest", `${Date.now() - start}ms`, response);
                this._loggingService.break();
                if (routes[i].dataResponse) {
                    const dataResponse = response as IDataResponse;
                    res.setHeader("Content-Type", dataResponse.contentType);
                    if (dataResponse.filename) {
                        res.setHeader("Content-Disposition", `attachment; filename="${dataResponse.filename}"`);
                    }
                    res.send(dataResponse.data);
                } else {
                    res.setHeader("Content-Type", "application/json");
                    res.send(JSON.stringify(response));
                }
                res.end();
            });
        }
    }

    /**
     * Load a module from the subfolder.
     * @param root The root folder for modules.
     * @param folder The sub folder.
     * @param func The function to load.
     * @returns The module.
     */
    public loadModule(root: string, folder: string, func: string): any {
        let modulePath = `${root}/`;
        if (folder) {
            modulePath += `${folder}/`;
        }
        modulePath += func;
        // tslint:disable-next-line:non-literal-require
        return require(path.join(this._workingDirectory, modulePath));
    }
}
