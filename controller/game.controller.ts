import { NextFunction, Request, Response, Router, response } from "express";
import wrapper from "../utils/wrapper";
import { PrismaClient } from "@prisma/client";
import joi from 'joi';
import { createError } from "../utils/error.handler";
import hasRole from "../utils/has_role.handler";

const prisma = new PrismaClient();

export class GameController {

    static async getGames(req: Request, res: Response, next: NextFunction) {
        const { category, id } = req.query;
        const validator = joi.string().uuid().validate(id);
        if (id && validator.error) return next(createError({
            code: 403,
            status: 'invalid query',
            message: `${id} is not a valid uuid.`
        }))
        const categories = (category as string)?.split(',');
        const games = await prisma.game.findMany({
            where: {
                id: (id) ? id as string : undefined,
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
        })
        const response = games.map(game => ({ ...game, categories: game.categories.map(c => c.category.name), userCount: game._count.UserGames, _count: undefined }))
        res.status(200).json(response)
    }

    static async createGame(req: Request, res: Response, next: NextFunction) {
        const create_request = joi.object().keys({
            title: joi.string().required().min(0),
            editor: joi.string().required().min(0),
            description: joi.string().required().min(10),
            image: joi.string().required().min(10),
            categories: joi.array().default([])
        }).required().unknown(false);
        const validator = create_request.validate(req.body);
        if (validator.error) return next(createError({
            code: 400,
            status: 'invalid request',
            message: validator.error.message,
        }))
        const { title, editor, description, image, categories } = req.body;
        const game = await prisma.game.create({
            data: {
                title: title,
                editor: editor,
                description: description,
                image: (image) ? image : 'null',
            }
        })
        // link with categories
        for (var category of categories as Array<string>) {
            await prisma.gameCategory.create({
                data: {
                    category_id: category,
                    game_id: game.id
                },
            })
        }

        res.status(201).json(game);
    }

    static async buyGame(req: Request, res: Response, next: NextFunction) {
        if (!req.user) return next(createError({
            code: 403,
            status: 'not connected',
            message: 'plz login.'
        }))
        const { game } = req.query;
        const validator = joi.string().uuid().validate(game);
        if (validator.error) return next(createError({
            code: 400,
            status: 'invalid id',
            message: `${game} is not a valid uuid.`
        }))
        // check if game exist
        const game_id = await prisma.game.findFirst({
            select: {
                id: true
            },
            where: {
                id: game as string
            }
        })
        if (!game_id) return next(createError({
            code: 404,
            status: 'game notfound',
            message: `there's no game with this id: ${game}`
        }))
        const response = await prisma.userGames.create({
            data: {
                user_id: req.user.id,
                game_id: game_id.id
            }
        })
        res.status(201).json(response)
    }

    static async deleteGame(req: Request, res: Response, next: NextFunction) {
        const { id } = req.query;
        const response = await prisma.game.delete({
            where: {
                id: id as string
            }, include: { categories: true }
        })
        res.status(202).json(response)
    }

    static async updateGame(req: Request, res: Response, next: NextFunction) {
        const update_request = joi.object().keys({
            title: joi.string().optional().min(2),
            editor: joi.string().optional().min(2),
            description: joi.string().optional().max(200).min(0)
        }).required().unknown(false).or('title', 'editor', 'description');
        const { id } = req.query;
        const validator = update_request.validate(req.body);
        if (validator.error) return next(createError({
            code: 400,
            status: 'invalid id',
            message: validator.error.message
        }))
        const response = await prisma.game.update({
            where: {
                id: id as string,
            },
            data: req.body
        })

        res.status(202).json(response)
    }

    static async getCategories(req: Request, res: Response, next: NextFunction) {
        const categories = await prisma.category.findMany()
        res.status(200).json(categories)
    }

    static router(): Router {
        const router = Router();

        router.get('/', wrapper(this.getGames))
        router.get('/categories', wrapper(this.getCategories))
        router.post('/', hasRole('admin'), wrapper(this.createGame))
        router.put('/', hasRole('admin'), wrapper(this.updateGame))
        router.delete('/', hasRole('admin'), wrapper(this.deleteGame))
        router.post('/buy', hasRole('user', 'admin'), wrapper(this.buyGame))

        return router;
    }
} 
