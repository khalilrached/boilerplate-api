"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const router_1 = __importDefault(require("./router"));
const error_handler_1 = require("./utils/error.handler");
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const logger_1 = __importDefault(require("./config/logger"));
dotenv_1.default.config();
const log = (0, logger_1.default)(__filename);
const app = (0, express_1.default)();
const PORT = process.env.PORT;
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use((0, cookie_parser_1.default)());
app.use((req, res, next) => {
    console.log(req.body);
    return next();
});
app.use('/api/v1', router_1.default.v1);
app.use((req, res) => {
    res.status(404).json({
        message: 'notfound'
    });
});
app.use((err, req, res, next) => {
    console.log(`❗[server]-[error]: `, err);
    if (err instanceof error_handler_1.ApiError)
        return res.status(err.code).json({
            status: err.status,
            message: err.message,
        });
    else
        return res.status(500).json({
            message: 'internal error.',
            details: (process.env.NODE_ENV === "prod") ? undefined : {
                name: err.message,
                stack: err.stack,
            }
        });
});
app.listen(PORT, () => {
    log.info(`[server]-[✅]: Server is running on http://localhost:${PORT}/`);
});
