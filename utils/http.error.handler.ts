import { Request, Response, NextFunction, RequestHandler } from 'express'
import { ApiError } from './error.handler'

const httpErrorHandler:any = (err: ApiError | Error, req: Request, res: Response, next: NextFunction) => {
    console.log(`❗[server]-[error]: `, err)
    if (err instanceof ApiError) {
        res.status(err.code).json({
            status: err.status,
            message: err.message,
        })
    } else {
        res.status(500).json({
            message: 'internal error.',
            details: (process.env.NODE_ENV === "prod") ? undefined : {
                name: err.message,
                stack: err.stack,
            }
        })
    } 
}

export default httpErrorHandler;