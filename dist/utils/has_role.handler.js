"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const error_handler_1 = require("./error.handler");
dotenv_1.default.config();
function hasRole(...roles) {
    return function (req, res, next) {
        // get accessToken 
        const accessToken = req.headers['x-access-token'] || req.cookies['accessToken'] || req.body['accessToken'];
        if (!accessToken)
            return next((0, error_handler_1.createError)({
                code: 403,
                status: 'invalid session',
                message: 'accessToken not found, try login using password and username'
            }));
        try {
            // decode accessToken
            const decode = jsonwebtoken_1.default.verify(accessToken, process.env.TOKEN_KEY);
            if (!roles.includes(decode.role))
                return next((0, error_handler_1.createError)({
                    code: 304,
                    status: 'forbidden',
                    message: `you do not have the rights as ${decode.role}`
                }));
            req.user = {
                id: decode.id,
                role: decode.role,
                username: decode.username
            };
            return next();
        }
        catch (err) {
            return next((0, error_handler_1.createError)({
                code: 500,
                status: 'internal error',
                message: err === null || err === void 0 ? void 0 : err.message
            }));
        }
    };
}
exports.default = hasRole;
