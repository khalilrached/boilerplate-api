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
exports.GameController = void 0;
const express_1 = require("express");
const wrapper_1 = __importDefault(require("../utils/wrapper"));
const client_1 = require("@prisma/client");
const joi_1 = __importDefault(require("joi"));
const error_handler_1 = require("../utils/error.handler");
const has_role_handler_1 = __importDefault(require("../utils/has_role.handler"));
const prisma = new client_1.PrismaClient();
class GameController {
    static getGames(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const { category, id } = req.query;
            const validator = joi_1.default.string().uuid().validate(id);
            if (id && validator.error)
                return next((0, error_handler_1.createError)({
                    code: 403,
                    status: 'invalid query',
                    message: `${id} is not a valid uuid.`
                }));
            const categories = category === null || category === void 0 ? void 0 : category.split(',');
            const games = yield prisma.game.findMany({
                where: {
                    id: (id) ? id : undefined,
                    categories: (!categories) ? undefined : {
                        some: {
                            category: {
                                name: {
                                    in: (categories) ? categories : []
                                }
                            }
                        }
                    }
                },
                include: {
                    _count: { select: { UserGames: true } },
                    categories: {
                        select: {
                            category: {
                                select: {
                                    name: true
                                }
                            }
                        }
                    }
                }
            });
            const response = games.map(game => (Object.assign(Object.assign({}, game), { categories: game.categories.map(c => c.category.name), userCount: game._count.UserGames, _count: undefined })));
            res.status(200).json(response);
        });
    }
    static createGame(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const create_request = joi_1.default.object().keys({
                title: joi_1.default.string().required().min(0),
                editor: joi_1.default.string().required().min(0),
                description: joi_1.default.string().required().min(10),
                image: joi_1.default.string().required().min(10),
                categories: joi_1.default.array().default([])
            }).required().unknown(false);
            const validator = create_request.validate(req.body);
            if (validator.error)
                return next((0, error_handler_1.createError)({
                    code: 400,
                    status: 'invalid request',
                    message: validator.error.message,
                }));
            const { title, editor, description, image, categories } = req.body;
            const game = yield prisma.game.create({
                data: {
                    title: title,
                    editor: editor,
                    description: description,
                    image: (image) ? image : 'null',
                }
            });
            // link with categories
            for (var category of categories) {
                yield prisma.gameCategory.create({
                    data: {
                        category_id: category,
                        game_id: game.id
                    },
                });
            }
            res.status(201).json(game);
        });
    }
    static buyGame(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!req.user)
                return next((0, error_handler_1.createError)({
                    code: 403,
                    status: 'not connected',
                    message: 'plz login.'
                }));
            const { game } = req.query;
            const validator = joi_1.default.string().uuid().validate(game);
            if (validator.error)
                return next((0, error_handler_1.createError)({
                    code: 400,
                    status: 'invalid id',
                    message: `${game} is not a valid uuid.`
                }));
            // check if game exist
            const game_id = yield prisma.game.findFirst({
                select: {
                    id: true
                },
                where: {
                    id: game
                }
            });
            if (!game_id)
                return next((0, error_handler_1.createError)({
                    code: 404,
                    status: 'game notfound',
                    message: `there's no game with this id: ${game}`
                }));
            const response = yield prisma.userGames.create({
                data: {
                    user_id: req.user.id,
                    game_id: game_id.id
                }
            });
            res.status(201).json(response);
        });
    }
    static deleteGame(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.query;
            const response = yield prisma.game.delete({
                where: {
                    id: id
                }, include: { categories: true }
            });
            res.status(202).json(response);
        });
    }
    static updateGame(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const update_request = joi_1.default.object().keys({
                title: joi_1.default.string().optional().min(2),
                editor: joi_1.default.string().optional().min(2),
                description: joi_1.default.string().optional().max(200).min(0)
            }).required().unknown(false).or('title', 'editor', 'description');
            const { id } = req.query;
            const validator = update_request.validate(req.body);
            if (validator.error)
                return next((0, error_handler_1.createError)({
                    code: 400,
                    status: 'invalid id',
                    message: validator.error.message
                }));
            const response = yield prisma.game.update({
                where: {
                    id: id,
                },
                data: req.body
            });
            res.status(202).json(response);
        });
    }
    static getCategories(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const categories = yield prisma.category.findMany();
            res.status(200).json(categories);
        });
    }
    static router() {
        const router = (0, express_1.Router)();
        router.get('/', (0, wrapper_1.default)(this.getGames));
        router.get('/categories', (0, wrapper_1.default)(this.getCategories));
        router.post('/', (0, has_role_handler_1.default)('admin'), (0, wrapper_1.default)(this.createGame));
        router.put('/', (0, has_role_handler_1.default)('admin'), (0, wrapper_1.default)(this.updateGame));
        router.delete('/', (0, has_role_handler_1.default)('admin'), (0, wrapper_1.default)(this.deleteGame));
        router.post('/buy', (0, has_role_handler_1.default)('user', 'admin'), (0, wrapper_1.default)(this.buyGame));
        return router;
    }
}
exports.GameController = GameController;
