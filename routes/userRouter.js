import { login, signup, get_profile, set_user_role, del_user, get_users, leaderboard } from "../controllers/user_controller.js";
import express from "express";
import authenticateToken from "../middlewares/authenticateToken.js";

const router = express.Router();

router.post("/login", login);
router.post("/signup", signup);
router.get("/profile", authenticateToken, get_profile);
router.put("/change/role/:userId/:newRole", authenticateToken, set_user_role);
router.get("/users", authenticateToken, get_users);
router.delete("/delete/:userid", authenticateToken, del_user);
router.get("/leaderboard", leaderboard);



export default router;
