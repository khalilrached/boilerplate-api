import passport from "passport";
import linkedInStrategy from "./linkedin.strategy";
import createLoggerInstance from "../config/logger";

const log = createLoggerInstance(__filename);

passport.use(linkedInStrategy);

log.info(`[passport]-[✅]: passport initialized.`)
