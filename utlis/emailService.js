import nodemailer from 'nodemailer';
import transporter from "../utlis/transporter.js"
import User from '../models/UserSchema.js';


export async function thankForBuying(invoiceid, customerName, customerEmail, companyName, companyEmail, userName, companyLogoUrl) {
  try {
    const info = await transporter.sendMail({
      from: `"${companyName}" <${companyEmail}>`,
      to: customerEmail,
      subject: "Thank You for Your Purchase!",
      text: `Dear ${customerName},

Thank you for your recent purchase. We truly appreciate your business and hope you enjoy your new product or service.

Attached is your invoice (Invoice Number: ${invoiceid}) for your records.

Should you have any questions, please feel free to contact us.

Thank you again for choosing ${companyName}. We look forward to serving you in the future.

Best regards,
${userName}
${companyName}
(This is an auto-generated email, please do not reply.)`,

      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; line-height: 1.6; color: #333;">
          <div style="text-align: center; margin-bottom: 20px;">
            <img src="${companyLogoUrl}" alt="${companyName} Logo" style="max-width: 200px; height: auto;" />
          </div>
          <p>Dear <strong>${customerName}</strong>,</p>
          <p>Thank you for your recent purchase. We truly appreciate your business and hope you enjoy your new <strong>product or service</strong>.</p>
          <p>Attached is your invoice (Invoice Number: <strong>${invoiceid}</strong>) for your records.</p>
          <p>Should you have any questions, please feel free to contact us.</p>
          <p>Thank you again for choosing <strong>${companyName}</strong>. We look forward to serving you in the future.</p>
          <p>Best regards,<br>${userName}<br>${companyName}</p>
          <small><em>This is an auto-generated email, please do not reply.</em></small>
        </div>
      `,
    });

    console.log("Message sent: %s", info.messageId);
  } catch (error) {
    console.error("Error sending email: ", error);
  }
}

export async function notifyLogin(userName, loginTime, location, deviceInfo) {
  try {
    const info = await transporter.sendMail({
      from: '"SkyFinance" <abadimustafa31@gmail.com>', // sender address
      to: "abadim488@gmail.com", // user email address
      subject: "Login Notification", // Subject line
      text: `Dear ${userName},\n\nWe noticed a login to your account on SkyFinance. Below are the details of the login:\n\nLogin Time: ${loginTime}\nLocation: ${location}\nDevice Information: ${deviceInfo}\n\nIf you did not initiate this login, please contact our support team immediately.\n\nThank you for using SkyFinance.\n\nBest regards,\n[Your Name]\n[Your Position]\nSkyFinance`, // plain text body
      html: `
                <p>Dear ${userName},</p>
                <p>We noticed a login to your account on SkyFinance. Below are the details of the login:</p>
                <p><strong>Login Time:</strong> ${loginTime}</p>
                <p><strong>Location:</strong> ${location}</p>
                <p><strong>Device Information:</strong>${deviceInfo.userAgent} -- ${deviceInfo.platform}</p>
                <p>If you did not initiate this login, please contact our support team immediately.</p>
                <p>Thank you for using SkyFinance.</p>
                <p>Best regards,<br><br><br>[Your Name]<br>[Your Position]<br>SkyFinance</p>
            `,
    });
    console.log("Message sent: %s", info.messageId);
  } catch (error) {
    console.error("Error sending email: ", error);
  }
}

export async function sendActionOtp(userId, email) {

  const html = `
    <h3>Authorization OTP</h3>
    <p>Your OTP to authorize this action is: <strong>${otp}</strong></p>
    <p>This code is valid for 5 minutes only.</p>
  `;

  await sendEmail(email, 'Action Authorization OTP', html);
}

export async function sendLoginOtp(email) {
  const user = await User.findOne({ email });
  if (!user) throw new Error("No user found with this email.");

 
  const html = `
    <h3>Login OTP</h3>
    <p>Your OTP for login is: <strong>${otp}</strong></p>
    <p>This code is valid for 5 minutes only.</p>
  `;

  await sendEmail(email, 'Your Login OTP', html);
}

