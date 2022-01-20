import Users from "../models/AdminModel.js";
import jwt from "jsonwebtoken";

export const RefreshToken = async (req, res) => {
    try {
        const refreshToken = req.cookies.refreshToken;
        if (!refreshToken) return res.sendStatus(401);
        const user = await Users.findAll({
            where: {
                refresh_token: refreshToken
            }
        });
        if (!user[0]) return res.sendStatus(403);
        jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, decoded) => {
            if (err) return res.sendStatus(403);
            const userid = user[0].id;
            const username = user[0].username;
            const accessToken = jwt.sign({ userid, username }, process.env.ACCESS_TOKEN_SECRET, {
                expiresIn: '60s'
            });
            res.json({ accessToken });
        })
    } catch (error) {
        console.log(error);
    }
}