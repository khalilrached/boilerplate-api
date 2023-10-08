import { RequestHandler, Request, Response, NextFunction } from "express";
import createLoggerInstance from "../config/logger";

const log = createLoggerInstance(__filename);

const httpLogger: any = (req: Request, res: Response, next: NextFunction) => {
    log.info(`[http]-[${req.method}]: ${req.url}`);
    next();
}

export default httpLogger;