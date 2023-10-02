"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function wrapper(fn) {
    const handler = (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
    return handler;
}
exports.default = wrapper;
