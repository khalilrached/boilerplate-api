"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createError = exports.ApiError = void 0;
class ApiError extends Error {
    constructor(args) {
        super(args.message);
        this.code = args.code;
        this.status = args.status;
    }
}
exports.ApiError = ApiError;
function createError(args) {
    return new ApiError(args);
}
exports.createError = createError;
