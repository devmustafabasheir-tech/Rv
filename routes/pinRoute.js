import express from "express";
import authenticateToken from "../middlewares/authenticateToken.js";
import {
    new_pin, get_pin_admin, get_pin_user, handel_pin,
    get_pin_by_id, pins_nearby, search_pins, update_pin,
    get_my_pin, delete_pin, report_pin,
} from "../controllers/pinController.js";

const router = express.Router(); // توحيد الاسم

router.post("/create", authenticateToken, new_pin);

router.get("/admin/list", authenticateToken, get_pin_admin);

router.get("/list", authenticateToken, get_pin_user);

router.put("/center/:action/:pinId", authenticateToken, handel_pin);

router.get("/find/:pinId", authenticateToken, get_pin_by_id);

router.get("/find/nearby", authenticateToken, pins_nearby);

router.get("/search", authenticateToken, search_pins);

router.put("/update/:pinId", authenticateToken, update_pin);

router.get("/mine", authenticateToken, get_my_pin);

router.delete("/delete/:pinId", authenticateToken, delete_pin);
router.put("/report/:pinId", authenticateToken, report_pin);



export default router;
