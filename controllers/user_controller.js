import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import User from "../models/UserSchema.js";
import upload from "../utlis/upload.js";
import { newUserID } from "../utlis/IDgeneration.js";
const secretKey = "king";



export const login = async (req, res) => {
  try {
    const { password, userEmail } = req.body;

    const user = await User.findOne({ email: userEmail });
    if (!user) return res.status(404).json({ message: "Wrong password or email" });

    const passwordCorrect = await bcrypt.compare(password, user.password);
    if (!passwordCorrect) return res.status(403).json({ message: "Incorrect password" });

    const accessToken = jwt.sign({ id: user._id, role: user.role }, secretKey, { expiresIn: "15m" });
    const refreshToken = jwt.sign({ id: user._id, role: user.role }, secretKey, { expiresIn: "7d" });

    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: 15 * 60 * 1000
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: 7 * 24 * 60 * 60 * 1000
    });


    console.log(accessToken, "we", refreshToken)

    // res.json({ message: "Logged in successfully!", acc: accessToken, ref: refreshToken });
    res.json({ message: "Logged in successfully!" });
  } catch (err) {
    console.error("Admin login error:", err);
    res.status(500).json({ message: "Server Error", error: err.message });
  }
};



export const signup = async (req, res) => {
    try {
 
      const {
        firstname,
        lastname,
        email,
        password,
      } = req.body;

      if (!password) return res.status(400).json({ message: "Please enter a password." });
      if (!email) return res.status(400).json({ message: "Email address is required." });

      if (!firstname || !lastname) {
        return res.status(400).json({ message: "Both first and last names are required." });
      }

      const lowerEmail = email.toLowerCase();

      const existingUser = await User.findOne({ email: lowerEmail });
      if (existingUser) {
        return res.status(409).json({ message: "Email already registered" });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const subid = await newUserID("User");

      const newUser = new User({
        firstname,
        lastname,
        accountStatus: "Active",
        email: lowerEmail,
        password: hashedPassword,
        subid,
        role: "User"
       });

      console.log(newUser)

      await newUser.save();

      res.status(201).json({ message: "Registration successful" });

    } catch (err) {
      console.error("Error registering user:", err);
      res.status(500).json({ message: "Server error", error: err.message });
    }
  }



export default { login, signup }