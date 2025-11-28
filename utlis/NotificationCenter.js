const mongoose = require('mongoose');
const express = require("express");
const router = express.Router();
const Permission = require("./permissionRoute");
const Notification = require("../models/notificationSchema");

async function createDeleteNotification(sender, entityType, entityId) {
    try {
        const notification = new Notification({
            sender,
            subject: 'Delete Request',
            entityId,
            message: `Delete request for ${entityType} with ID ${entityId} is pending approval.`
        });
        await notification.save();
        console.log('Notification created successfully.');
    } catch (err) {
        console.error('Error creating notification:', err.message);
    }
}

async function createExpiryNotification(productId) {
    try {
        const notification = new Notification({
            sender: "System",
            subject: 'Product Expiration Date',
            entityId: productId,
            message: 'Some products are about to expire.'
        });
        await notification.save();
        console.log('Expiration notification created successfully.');
    } catch (err) {
        console.error('Error creating expiration notification:', err.message);
    }
}

async function createActionOTPNotification(userId, purpose, otp) {
    try {
        const notification = new Notification({
            sender: "System",
            subject: "OTP Issued",
            entityId: userId,
            message: `OTP (${otp}) has been issued for "${purpose}" action. Valid for 5 minutes.`
        });
        await notification.save();
        console.log("Action OTP notification created.");
    } catch (err) {
        console.error("Error creating OTP notification:", err.message);
    }
}

module.exports = {
    createDeleteNotification,
    createExpiryNotification,
    createActionOTPNotification,
    Notification
};
