const catchError = require('../utils/catchError');
const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const sendEmail = require('../utils/sendMail');
require('dotenv').config();

const getAll = catchError(async(req, res) => {
    const results = await User.findAll();
    return res.json(results);
});

const create = catchError(async(req, res) => {
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    const result = await User.create({...req.body, password: hashedPassword})

    const tokenToVerify = jwt.sign(
		{ result }, // payload
		process.env.TOKEN_SECRET, // clave secreta
		{ expiresIn: '24h' } // OPCIONAL: Tiempo en el que expira el token
)
    await sendEmail({
        to: result.email,
        subject: "Verificación de Email",
        html: `
        <a href="${req.body.frontBaseURL}/verify_email/${tokenToVerify}">Click en el enlace para verificar E-mail</a>
        `
    })

    return res.status(201).json(result);
});

const getOne = catchError(async(req, res) => {
    const { id } = req.params;
    const result = await User.findByPk(id);
    if(!result) return res.sendStatus(404);
    return res.json(result);
});

const remove = catchError(async(req, res) => {
    const { id } = req.params;
    await User.destroy({ where: {id} });
    return res.sendStatus(204);
});

const update = catchError(async(req, res) => {
    const { id } = req.params;
    const {firstname, lastname, email} = req.body
    const result = await User.update(
        {firstname, lastname, email},
        { where: {id}, returning: true }
    );
    if(result[0] === 0) return res.sendStatus(404);
    return res.json(result[1][0]);
});

const login = catchError(async(req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({where: {email}})
    if (!user) {
        return res.status(401).json({message: "Invalid credentials"})
    }
    
    const isValid = await bcrypt.compare(password, user.password)

    if (!isValid) {
        return res.status(401).json({message: "Invalid credentials"})
    }
    
    const token = jwt.sign(
		{ user }, // payload
		process.env.TOKEN_SECRET, // clave secreta
		{ expiresIn: '1000h' } // OPCIONAL: Tiempo en el que expira el token
)

    res.json({user, token})
});

const getMe = catchError(async(req, res) => {
    res.json({user: req.user})
});

const verifyEmail = catchError(async(req, res) => {
    const { token } = req.params
    const data = jwt.verify(
        token,
        process.env.TOKEN_SECRET)

    await User.update({isVerified: true}, {where: {id: data.result.id}})

    res.json({success: true})
});

module.exports = {
    getAll,
    create,
    getOne,
    remove,
    update,
    login,
    getMe,
    verifyEmail
}