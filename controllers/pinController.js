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

        if (!location || !infomation || !adder || !type) {
            return res.status(400).json({ message: "All fields are required" });
        }

        if (!location.coordinates || location.coordinates.length !== 2) {
            return res.status(400).json({ message: "Invalid location coordinates" });
        }

        const [lng, lat] = location.coordinates;

        const existingPin = await Pin.findOne({
            location: {
                $near: {
                    $geometry: { type: "Point", coordinates: [lng, lat] },
                    $maxDistance: 5
                }
            }
        });

        if (existingPin) {
            return res.status(409).json({ message: "A Pin at this location already exists" });
        }

        const pinId = await createID("Pin");

        const newPin = new Pin({
            pinId,
            location,
            infomation,
            adder,
            type,
            user: userId,
            status,
            isPending
        });

        await newPin.save();

        return res.status(201).json({ message: "Pin created successfully" });

    } catch (err) {
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

        res.status(200).json({ pins, message: "ok" });
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
        const userId = req.user.id;
        const userRole = req.user.role;
        const action = req.params.action;
        const pinId = req.params.pinId;
        let actionStatus = "";

        if (userRole !== "admin") {
            return res.status(403).json({ message: "You are not authorized" });
        }

        const reqPin = await Pin.findById(pinId);
        if (!reqPin) {
            return res.status(404).json({ message: "Pin not found" });
        }


        if (action === "r") {
            await Pin.findByIdAndDelete(pinId);
            actionStatus = "Rejected and Deleted";
        } else if (action === "a") {
            reqPin.isPending = "active";
            reqPin.status = "approved";
            reqPin.handeldBy = userId
            await reqPin.save();
            actionStatus = "approved";
        } else {
            return res.status(400).json({ message: "Invalid action" });
        }

        res.status(200).json({ pin: pinId, message: `Pin ${actionStatus}` });

    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "Server Error", error: err.message });
    }
};

export const get_pin_by_id = async (req, res) => {
    try {
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

        if (!lng || !lat) return res.status(400).json({ message: "Coordinates required" });

        const pins = await Pin.find({
            location: {
                $near: {
                    $geometry: { type: "Point", coordinates: [lng, lat] },
                    $maxDistance: radius
                }
            },
            status: "approved"
        }).lean();

        if (pins.length === 0) {
            return res.status(404).json({ message: "No Pins found nearby" });
        }

        res.status(200).json({ pins });
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

        if (!pin.reportedBy) pin.reportedBy = [];
        if (!pin.reportedBy.includes(userId)) {
            pin.reportedBy.push(userId);
        }

        pin.isPending = "pending deletion";

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