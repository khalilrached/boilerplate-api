"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const winston_1 = require("winston");
const path_1 = __importDefault(require("path"));
const { combine, timestamp, label, printf } = winston_1.format;
const APP_NAME = "";
function createLoggerInstance(filename) {
    const fname = path_1.default.basename(filename);
    const fileRotateTransport = new winston_1.transports.File({
        dirname: './log',
        filename: "debug-%DATE%.log",
    });
    //Using the printf format.
    const customFormat = printf(({ level, message, label, timestamp, stack }) => {
        return `${timestamp} [filename][${fname}] [${label}] ${level}: ${message} ${(stack) ? stack : ''}`;
    });
    const colors = {
        error: 'red',
        warn: 'yellow',
        info: 'cyan',
        debug: 'green'
    };
    const logger = (0, winston_1.createLogger)({
        level: "debug",
        format: combine(label({ label: APP_NAME }), winston_1.format.splat(), winston_1.format.errors({ stack: true }), timestamp({ format: "MMM-DD-YYYY HH:mm:ss" }), customFormat),
        transports: [
            new winston_1.transports.Console({ format: combine(label({ label: APP_NAME }), winston_1.format.colorize({ colors: colors, message: true, level: true }), timestamp({ format: "MMM-DD-YYYY HH:mm:ss" }), customFormat) }),
            fileRotateTransport,
        ],
    });
    return logger;
}
exports.default = createLoggerInstance;
;
