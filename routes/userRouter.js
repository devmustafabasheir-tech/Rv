import { login, signup, get_profile } from "../controllers/user_controller.js";
import express from "express";
import authenticateToken from "../middlewares/authenticateToken.js";

const router = express.Router();

router.post("/login", login);
router.post("/signup", signup);
router.get("/profile", authenticateToken, get_profile);


export default router;
