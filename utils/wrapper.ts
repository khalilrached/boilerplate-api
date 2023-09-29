import { RequestHandler } from "express";

export default function wrapper(fn: any) {
    const handler: RequestHandler = (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    }
    return handler;
}