import express from "express";
import { getUser, Registration, Login, Logout } from "../controllers/Users.js";
import { verifyToken } from "../middleware/accessToken.js";
import { RefreshToken } from "../controllers/RefreshToken.js";

const router = express.Router();

router.get('/users', verifyToken, getUser);
router.post('/users', Registration);
router.post('/login', Login);
router.get('/token', RefreshToken);
router.delete('/logout', Logout);

export default router;