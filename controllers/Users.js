import Users from "../models/AdminModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export const getUser = async (req, res) => {
    try {
        const users = await Users.findAll({
            attributes: [
                'id',
                'username',
                'name',
                'email',
                'photo',
                'phone',
                'gender',
                'last_login'
            ]
        });
        res.json(users);
    } catch (error) {
        console.log(error);
    }
}

export const Registration = async (req, res) => {
    const { username, name, email, password, confirmPassword, gender } = req.body;
    if (password !== confirmPassword) return res.status(400).json({ msg: "Password and Confirm Password does not match!" });
    const salt = await bcrypt.genSalt();
    const passwordHash = await bcrypt.hash(password, salt);
    try {
        await Users.create({
            username: username,
            name: name,
            email: email,
            gender: gender,
            password: passwordHash,
        });
        res.json({ msg: "Data have been added!" });
    } catch (error) {
        console.log(error);
    }
}

export const Login = async (req, res) => {
    try {
        const user = await Users.findAll({
            where: {
                email: req.body.email
            }
        });
        const match = await bcrypt.compare(req.body.password, user[0].password);
        if (!match) return res.status(400).json({ msg: "Wrong password!" });
        const userid = user[0].id;
        const username = user[0].username;
        const accessToken = jwt.sign({ userid, username }, process.env.ACCESS_TOKEN_SECRET, {
            expiresIn: '60s'
        });
        const refreshToken = jwt.sign({ userid, username }, process.env.REFRESH_TOKEN_SECRET, {
            expiresIn: '30d',

        });
        await Users.update({ refresh_token: refreshToken }, {
            where: {
                id: userid
            }
        });
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            maxAge: 30 * 24 * 60 * 60 * 1000,
            // secure: true
        });
        res.json({ accessToken });
    } catch (error) {
        res.status(400).json({ msg: "Email does not matched!" });
    }
}

export const Logout = async (req, res) => {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) return res.sendStatus(204);
    const user = await Users.findAll({
        where: {
            refresh_token: refreshToken
        }
    });
    if (!user[0]) return res.sendStatus(204);
    const userid = user[0].id;
    await Users.update({ refresh_token: null }, {
        where: {
            id: userid
        }
    });
    res.clearCookie('refreshToken');
    return res.sendStatus(200);
}