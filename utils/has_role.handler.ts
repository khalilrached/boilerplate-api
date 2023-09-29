import { NextFunction, Request, Response } from "express";
import dotenv from 'dotenv';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { createError } from "./error.handler";

dotenv.config();

export default function hasRole(...roles: string[]) {
    return function (req: Request, res: Response, next: NextFunction) {
        // get accessToken 
        const accessToken = req.headers['x-access-token'] || req.cookies['accessToken'] || req.body['accessToken'];
        if (!accessToken) return next(createError({
            code: 403,
            status: 'invalid session',
            message: 'accessToken not found, try login using password and username'
        }))
        try {
            // decode accessToken
            const decode = jwt.verify(accessToken, process.env.TOKEN_KEY as string) as JwtPayload
            if (!roles.includes(decode.role)) return next(createError({
                code: 304,
                status: 'forbidden',
                message: `you do not have the rights as ${decode.role}`
            }))

            req.user = {
                id: decode.id,
                role: decode.role,
                username: decode.username
            }

            return next();
        } catch (err) {
            return next(createError({
                code: 500,
                status: 'internal error',
                message: (err as Error)?.message
            }))
        }
    }
}