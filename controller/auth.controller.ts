import { NextFunction, RequestHandler, Router, Request, Response } from "express";
import wrapper from "../utils/wrapper";
import joi from 'joi';
import { createError } from "../utils/error.handler";
import { Prisma, PrismaClient } from "@prisma/client";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();
export class AuthController {

    static async login(req: Request, res: Response, next: NextFunction) {

        const login_request = joi.object().keys({
            username: joi.string().min(0).required(),
            password: joi.string().min(0).required()
        })
            .required()
            .unknown(false);
        // validate request body
        const validator = login_request.validate(req.body);

        if (validator.error) return next(createError({
            code: 400,
            status: 'invalid request',
            message: validator.error.message,
        }))

        const { username, password } = req.body;
        // get user with username
        const user = await prisma.user.findFirst({
            where: {
                username: username
            }
        })
        // check if user name exist
        if (!user) return next(createError({
            code: 404,
            status: 'user notfound',
            message: `username:${username} does not exist.`
        }))
        // compare password
        const wrongPassword = !bcrypt.compareSync(password, user.password);
        if (wrongPassword) return next(createError({
            code: 403,
            status: 'invalid credentials',
            message: 'wrong password'
        }))
        // sign token
        const tokenData = {
            id: user.id,
            username: user.username,
            image: user.image,
            role: user.role
        }
        const accessToken = jwt.sign(tokenData, process.env.TOKEN_KEY as string, { expiresIn: '24h' })
        res.cookie('accessToken', accessToken)
        res.status(200).json({
            accessToken
        })
    }

    static async signup(req: Request, res: Response, next: NextFunction) {
        const signup_request = joi.object().keys({
            username: joi.string().required().min(8),
            password: joi.string().required().regex(new RegExp('^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$')),
            image: joi.string().default("null"),
            email: joi.string().email().required(),
            bornAt: joi.string().required()
        }).required().unknown(false);

        const validator = signup_request.validate(req.body);
        if (validator.error) return next(createError({
            status: 'invalid request',
            code: 400,
            message: validator.error.message,
        }))
        const { username, email, image, password, bornAt } = req.body;

        const adminEmail = await prisma.admin.findFirst({
            where: {
                email: email
            }
        })

        const role = (adminEmail) ? 'admin' : 'user';
        const hashedPassword = bcrypt.hashSync(password, 10);
        const user = await prisma.user.create({
            data: {
                username: username,
                email: email,
                image: (image) ? image : 'null',
                password: hashedPassword,
                bornAt: bornAt,
                role: role
            }
        })
        res.status(202).json({
            message: 'account created',
            username: user.username,
            email: user.email
        })
    }

    static router(): Router {
        const router = Router();

        router.post('/login', wrapper(this.login))
        router.post('/signup', wrapper(this.signup))

        return router;
    }
} 
