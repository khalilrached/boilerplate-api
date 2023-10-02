"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const express_1 = require("express");
const wrapper_1 = __importDefault(require("../utils/wrapper"));
const joi_1 = __importDefault(require("joi"));
const error_handler_1 = require("../utils/error.handler");
const client_1 = require("@prisma/client");
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const prisma = new client_1.PrismaClient();
class AuthController {
    static login(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const login_request = joi_1.default.object().keys({
                username: joi_1.default.string().min(0).required(),
                password: joi_1.default.string().min(0).required()
            })
                .required()
                .unknown(false);
            // validate request body
            const validator = login_request.validate(req.body);
            if (validator.error)
                return next((0, error_handler_1.createError)({
                    code: 400,
                    status: 'invalid request',
                    message: validator.error.message,
                }));
            const { username, password } = req.body;
            // get user with username
            const user = yield prisma.user.findFirst({
                where: {
                    username: username
                }
            });
            // check if user name exist
            if (!user)
                return next((0, error_handler_1.createError)({
                    code: 404,
                    status: 'user notfound',
                    message: `username:${username} does not exist.`
                }));
            // compare password
            const wrongPassword = !bcrypt_1.default.compareSync(password, user.password);
            if (wrongPassword)
                return next((0, error_handler_1.createError)({
                    code: 403,
                    status: 'invalid credentials',
                    message: 'wrong password'
                }));
            // sign token
            const tokenData = {
                id: user.id,
                username: user.username,
                image: user.image,
                role: user.role
            };
            const accessToken = jsonwebtoken_1.default.sign(tokenData, process.env.TOKEN_KEY, { expiresIn: '24h' });
            res.cookie('accessToken', accessToken);
            res.status(200).json({
                accessToken
            });
        });
    }
    static signup(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const signup_request = joi_1.default.object().keys({
                username: joi_1.default.string().required().min(8),
                password: joi_1.default.string().required().regex(new RegExp('^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$')),
                image: joi_1.default.string().default("null"),
                email: joi_1.default.string().email().required(),
                bornAt: joi_1.default.string().required()
            }).required().unknown(false);
            const validator = signup_request.validate(req.body);
            if (validator.error)
                return next((0, error_handler_1.createError)({
                    status: 'invalid request',
                    code: 400,
                    message: validator.error.message,
                }));
            const { username, email, image, password, bornAt } = req.body;
            const adminEmail = yield prisma.admin.findFirst({
                where: {
                    email: email
                }
            });
            const role = (adminEmail) ? 'admin' : 'user';
            const hashedPassword = bcrypt_1.default.hashSync(password, 10);
            const user = yield prisma.user.create({
                data: {
                    username: username,
                    email: email,
                    image: (image) ? image : 'null',
                    password: hashedPassword,
                    bornAt: bornAt,
                    role: role
                }
            });
            res.status(202).json({
                message: 'account created',
                username: user.username,
                email: user.email
            });
        });
    }
    static router() {
        const router = (0, express_1.Router)();
        router.post('/login', (0, wrapper_1.default)(this.login));
        router.post('/signup', (0, wrapper_1.default)(this.signup));
        return router;
    }
}
exports.AuthController = AuthController;
