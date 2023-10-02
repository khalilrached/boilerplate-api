import express from "express";
import jwt from 'jsonwebtoken';

declare module "express" {
    interface Request extends express.Request {
        user?: {
            id: string,
            role: string,
            username: string
        }
    }
}

declare module "jsonwebtoken" {
    interface JwtPayload {
        id: string,
        role: string,
        username: string,
        image: string
    }
}
