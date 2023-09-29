import { Router, Response, Request } from 'express';
import { AuthController } from '../controller/auth.controller';
import { UserController } from '../controller/user.controller';
import { GameController } from '../controller/game.controller';


const v1 = Router()

v1.use('/auth', AuthController.router())
v1.use('/game', GameController.router())
v1.use('/user', UserController.router())

export default {
    v1
}; 