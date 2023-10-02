"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_controller_1 = require("../controller/auth.controller");
const user_controller_1 = require("../controller/user.controller");
const game_controller_1 = require("../controller/game.controller");
const v1 = (0, express_1.Router)();
v1.use('/auth', auth_controller_1.AuthController.router());
v1.use('/game', game_controller_1.GameController.router());
v1.use('/user', user_controller_1.UserController.router());
exports.default = {
    v1
};
