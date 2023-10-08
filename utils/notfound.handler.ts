import { Request, Response, NextFunction, RequestHandler } from 'express'
import { ApiError } from './error.handler'

const notfoundHandler:any = (req: Request, res: Response) => {
    res.status(404).json({
        message: 'notfound'
    })
}

export default notfoundHandler;