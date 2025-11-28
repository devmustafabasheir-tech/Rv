import OtpToken from '../models/otpTokenSchema.js';
import crypto from 'crypto';
import { createActionOTPNotification } from './NotificationCenter.js'; // تأكد من وجود export صحيح

export async function generateOtp(userId, email = null, purpose = 'login') {
    const otp = crypto.randomInt(100000, 999999).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 دقائق

    await OtpToken.create({
        user: userId,
        email,
        otp,
        purpose,
        expiresAt
    });

    // إرسال إشعار إذا لم يكن تسجيل دخول
    if (purpose === 'login') {
        await sendLoginOtp(email, otp);
    } else {
        await createActionOTPNotification(userId, purpose, otp);
        await sendActionOtp(userId, email, otp);
    }

    return otp;
}

export async function validateOtp(userId, email = null, enteredOtp, purpose) {
    const otpDoc = await OtpToken.findOne({
        user: userId,
        email,
        otp: enteredOtp,
        purpose,
        expiresAt: { $gt: new Date() },
        used: false
    });

    if (!otpDoc) {
        throw new Error("Invalid or expired OTP.");
    }

    otpDoc.used = true;
    await otpDoc.save();
    return true;
}
