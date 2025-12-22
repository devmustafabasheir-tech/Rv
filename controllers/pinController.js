import express from "express";
import User from "../models/UserSchema.js";
import Pin from "../models/pinSchema.js"
import { createID } from "../utlis/IDgeneration.js";

export const new_pin = async (req, res) => {
    try {
        const userId = req.user.id;
        const userRole = req.user.role;
        let isPending;
        let status;

        if (userRole === "user") {
            status = "pending";
            isPending = "pending addition";
        } else if (userRole === "admin") {
            status = "approved";
            isPending = "active";
        }

        const { location, infomation, adder, type } = req.body;

        if (!location || !adder || !type) {
            return res.status(400).json({ message: "All fields are required" });
        }

        location.latitude = parseFloat(location.latitude);
        location.longitude = parseFloat(location.longitude);

        if (isNaN(location.latitude) || isNaN(location.longitude)) {
            return res.status(400).json({ message: "Invalid location coordinates" });
        }

        const pinId = await createID("Pin");

        /**
         *  let imageUrl = null;
 
         if (req.file) {
             const result = await uploadToImgbb(req.file.buffer, process.env.IMGBB_KEY);
 
             if (!result.success) {
                 return res.status(500).json({ message: "Image upload failed", error: result.error });
             }
 
             imageUrl = result.url;
         }
         */

        const newPin = new Pin({
            pinId,
            location,
            infomation,
            adder,
            type,
            user: userId,
            status,
            isPending,
        });

        await newPin.save();

        return res.status(201).json({ message: "Pin created successfully" });

    } catch (err) {
        /**if (err.code === "LIMIT_FILE_SIZE") {
            return res.status(400).json({ message: "File too large. Max 5MB allowed." });
        } */

        console.log(err);
        res.status(500).json({ message: "Server Error", error: err.message });
    }
};

export const get_pin_admin = async (req, res) => {
    try {
        const userRole = req.user.role;
        if (userRole !== "admin") {
            return res.status(403).json({ message: "You are not authorized" });
        }
        const pins = await Pin.find().lean();
        let pendingPinForAddition = [];
        let pendingPinForDeletion = [];

        pins.forEach(p => {
            if (p.isPending === "pending deletion") {
                pendingPinForDeletion.push(p);

            } else if (p.isPending === "pending addition") {
                pendingPinForAddition.push(p);
            }

        });

        res.status(200).json({ pins, pendingPinForAddition, pendingPinForDeletion, message: "ok" });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "Server Error", error: err.message });
    }
};

export const get_pin_user = async (req, res) => {
    try {
        const pins = await Pin.find({ status: "approved" }).lean();
        res.status(200).json({ pins, message: "ok" });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "Server Error", error: err.message });
    }
};

export const handel_pin = async (req, res) => {
    try {
        const adminId = req.user.id;
        const userRole = req.user.role;
        const { action, pinId } = req.params;

        const reward_for_create = 20;
        const reward_for_report = 20;

        if (userRole !== "admin") {
            return res.status(403).json({ message: "You are not authorized" });
        }

        const pin = await Pin.findById(pinId);
        if (!pin) return res.status(404).json({ message: "Pin not found" });

        let actionStatus = "";

        // ========== Reject new pin ==========
        if (action === "r") {
            pin.isPending = "pending addition";
            pin.status = "rejected";
            pin.handeldBy = adminId;
            await pin.save();
            actionStatus = "rejected";

            // ========== Approve new pin ==========
        } else if (action === "a") {
            const owner = await User.findById(pin.user);
            if (owner) {
                owner.point += reward_for_create;
                await owner.save();
            }

            pin.isPending = "active";
            pin.status = "approved";
            pin.handeldBy = adminId;
            await pin.save();
            actionStatus = "approved";

            // ========== Delete reported pin ==========
        }
        else if (action === "drp") {
            if (pin.isPending !== "pending deletion") {
                return res.status(409).json({ message: "Pin is not reported" });
            }

            if (pin.reportedBy) {
                const reporter = await User.findById(pin.reportedBy);
                if (reporter) {
                    reporter.point += reward_for_report;
                    await reporter.save();
                }
            }

            await pin.deleteOne();
            actionStatus = "deleted";
        }
        else if (action === "rrp") {
            pin.isPending = "active";
            pin.status = "approved";
            pin.reportedBy = null;
            pin.handeldBy = adminId;
            await pin.save();
            actionStatus = "report rejected";

        } else {
            return res.status(400).json({ message: "Invalid action" });
        }

        res.status(200).json({
            pin: pinId,
            message: `Pin ${actionStatus}`
        });

    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "Server Error", error: err.message });
    }
};

export const get_pin_by_id = async (req, res) => {
    try {
        if (userRole !== "admin") {
            return res.status(403).json({ message: "You are not authorized" });
        }
        const pin = await Pin.findById(req.params.pinId).lean();
        if (!pin) return res.status(404).json({ message: "Pin not found" });
        res.status(200).json({ pin });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "Server Error", error: err.message });
    }
};

export const pins_nearby = async (req, res) => {
    try {
        const lng = parseFloat(req.query.lng);
        const lat = parseFloat(req.query.lat);
        const radius = parseInt(req.query.radius) || 500;

        if (isNaN(lng) || isNaN(lat)) {
            return res.status(400).json({ message: "Coordinates required" });
        }

        const pins = await Pin.find({ status: "approved" }).lean();

        const haversine = (lat1, lon1, lat2, lon2) => {
            const R = 6371000;
            const toRad = deg => deg * Math.PI / 180;

            const dLat = toRad(lat2 - lat1);
            const dLon = toRad(lon2 - lon1);

            const a =
                Math.sin(dLat / 2) ** 2 +
                Math.cos(toRad(lat1)) *
                Math.cos(toRad(lat2)) *
                Math.sin(dLon / 2) ** 2;

            const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
            return R * c;
        };

        const nearbyPins = pins.filter(pin => {
            const dist = haversine(
                lat,
                lng,
                pin.location.latitude,
                pin.location.longitude
            );
            return dist <= radius;
        });

        if (nearbyPins.length === 0) {
            return res.status(404).json({ message: "No Pins found nearby" });
        }

        res.status(200).json({ pins: nearbyPins });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "Server Error", error: err.message });
    }
};

export const search_pins = async (req, res) => {
    try {
        const query = req.query.query;
        const lng = parseFloat(req.query.lng);
        const lat = parseFloat(req.query.lat);
        const radius = parseInt(req.query.radius) || 500;

        if (!query) return res.status(400).json({ message: "Query required" });

        let searchFilter = {
            $or: [
                { infomation: { $regex: query, $options: "i" } },
                { adder: { $regex: query, $options: "i" } },
                { type: { $regex: query, $options: "i" } }
            ],
            status: "approved"
        };

        if (!isNaN(lng) && !isNaN(lat)) {
            searchFilter.location = {
                $near: {
                    $geometry: { type: "Point", coordinates: [lng, lat] },
                    $maxDistance: radius
                }
            };
        }

        const pins = await Pin.find(searchFilter).lean();

        if (pins.length === 0) return res.status(404).json({ message: "No Pins found" });

        res.status(200).json({ pins });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "Server Error", error: err.message });
    }
};

export const update_pin = async (req, res) => {
    try {
        const userId = req.user.id;
        const userRole = req.user.role;
        const pinId = req.params.pinId;
        const { infomation, type, location, adder } = req.body;

        if (!infomation || !type || !infomation || !type) {
            return res.status(400).json({ message: "Nothing to update" });
        }

        const pin = await Pin.findById(pinId);
        if (!pin) return res.status(404).json({ message: "Pin not found" });

        if (userRole === "user") {
            if (pin.user.toString() !== userId) {
                return res.status(403).json({ message: "You can only update your own pins" });
            }
            if (pin.status === "approved") {
                return res.status(403).json({ message: "You cannot update approved pins" });
            }
        }

        if (infomation) pin.infomation = infomation;
        if (type) pin.type = type;
        if (location) pin.location = location;
        if (adder) pin.adder = adder;
        pin.status = "pending";
        pin.isPending = "pending addition";

        await pin.save();

        res.status(200).json({ pin, message: "Pin updated successfully" });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "Server Error", error: err.message });
    }
};

export const get_my_pin = async (req, res) => {
    try {
        const userId = req.user.id;
        const pins = await Pin.find({ user: userId }).lean();
        if (!pins.length) return res.status(404).json({ message: "No pins found" });

        res.status(200).json({ pins, message: "ok" });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "Server Error", error: err.message });
    }
};

export const report_pin = async (req, res) => {
    try {
        const userId = req.user.id;
        const pinId = req.params.pinId;

        const pin = await Pin.findById(pinId);
        if (!pin) return res.status(404).json({ message: "Pin not found" });

        if (pin.reportedBy)
            return res.status(409).json({ message: "Pin already reported" });

        pin.reportedBy = userId;
        pin.isPending = "pending deletion";
        pin.status = "pending";

        await pin.save();

        res.status(200).json({ message: "Pin reported successfully" });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "Server Error", error: err.message });
    }
};

export const delete_pin = async (req, res) => {
    try {
        const userRole = req.user.role;
        const pinId = req.params.pinId;

        if (userRole !== "admin") {
            return res.status(403).json({ message: "You are not authorized" });
        }

        const pin = await Pin.findByIdAndDelete(pinId);
        res.status(200).json({ message: "Pin deleted successfully" });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "Server Error", error: err.message });
    }
};





export default { report_pin, get_my_pin, new_pin, get_pin_admin, get_pin_user, handel_pin, get_pin_by_id, pins_nearby, search_pins, update_pin }