import express from "express";
import authenticateToken from "../middlewares/authenticateToken.js";
import {
    new_pin, get_pin_admin, get_pin_user, handel_pin,
    get_pin_by_id, pins_nearby, search_pins, update_pin,
    get_my_pin, delete_pin, report_pin,
} from "../controllers/pinController.js";

const router = express.Router();

router.post("/create", authenticateToken, new_pin);//

router.get("/admin/list", authenticateToken, get_pin_admin);//

router.get("/list", authenticateToken, get_pin_user);//

router.get("/find/:pinId", authenticateToken, get_pin_by_id);//

router.put("/update/:pinId", authenticateToken, update_pin);//

router.delete("/delete/:pinId", authenticateToken, delete_pin);//

router.put("/report/:pinId", authenticateToken, report_pin);//

router.get("/find/nearby", authenticateToken, pins_nearby);

router.put("/center/:action/:pinId", authenticateToken, handel_pin);

//first !@#$%^&*()

router.get("/search", authenticateToken, search_pins);

router.get("/mine", authenticateToken, get_my_pin);




export default router;
