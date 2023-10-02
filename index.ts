import express, { Express, NextFunction, Request, Response } from 'express';
import dotenv from 'dotenv';
import router from './router';
import { ApiError } from './utils/error.handler';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import createLoggerInstance from './config/logger';

dotenv.config()

const log = createLoggerInstance(__filename);

const app: Express = express();
const PORT = process.env.PORT

app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())

app.use((req: Request, res: Response, next: NextFunction) => {
    console.log(req.body)
    return next();
})

app.use('/api/v1', router.v1)

app.use((req: Request, res: Response) => {
    res.status(404).json({
        message: 'notfound'
    })
})

app.use((err: ApiError | Error, req: Request, res: Response, next: NextFunction) => {
    console.log(`❗[server]-[error]: `, err)
    if (err instanceof ApiError) return res.status(err.code).json({
        status: err.status,
        message: err.message,
    })
    else return res.status(500).json({
        message: 'internal error.',
        details: (process.env.NODE_ENV === "prod") ? undefined : {
            name: err.message,
            stack: err.stack,
        }
    })
})

app.listen(PORT, () => {
	log.info(`[server]-[✅]: Server is running on http://localhost:${PORT}/`);
})
