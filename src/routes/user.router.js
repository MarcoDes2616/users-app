const { getAll, create, getOne, remove, update, login, getMe, verifyEmail, resetPaswwordMail, updatePassword } = require('../controllers/user.controllers');
const express = require('express');
const verifyJWT = require('../middleware/auth.middleware');

const userRouter = express.Router();

userRouter.route('/')
    .get(verifyJWT, getAll)
    .post(create);
    
userRouter.route("/logged")
    .get(getMe)

userRouter.route("/login")
    .post(login)

userRouter.route("/me")
    .get(verifyJWT, getMe)

userRouter.route("/reset_password")
    .post(resetPaswwordMail)

userRouter.route("/reset_password/:token")
    .post(updatePassword)

userRouter.route("/verify/:token")
    .get(verifyEmail)

userRouter.route('/:id')
    .get(verifyJWT, getOne)
    .delete(verifyJWT, remove)
    .put(verifyJWT, update);

module.exports = userRouter;