const { getAll, create, getOne, remove, update, login, getMe } = require('../controllers/user.controllers');
const express = require('express');
const verifyJWT = require('../middleware/auth.middleware');

const userRouter = express.Router();

userRouter.route('/')
    .get(verifyJWT, getAll)
    .post(create);
    
userRouter.route("/logged")
        .get(verifyJWT, getMe)

userRouter.route("/login")
    .post(login)

userRouter.route('/:id')
    .get(verifyJWT, getOne)
    .delete(remove)
    .put(update);

module.exports = userRouter;