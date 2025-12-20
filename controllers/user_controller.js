import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import User from "../models/UserSchema.js";
import Pin from "../models/pinSchema.js";
import { newUserID } from "../utlis/IDgeneration.js";

const secretKey = "king";

// ================= LOGIN =====================
export const login = async (req, res) => {
  try {
    const { password, userEmail } = req.body;

    if (!userEmail) {
      return res.status(400).json({ message: "Email is required" });
    }
    if (!password) {
      return res.status(400).json({ message: "Password is required" });
    }

    const lowerEmail = userEmail.toLowerCase();

    const user = await User.findOne({ email: lowerEmail });
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

    res.json({ message: "Logged in successfully!" });

  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Server Error", error: err.message });
  }
};

// ================= SIGNUP =====================
export const signup = async (req, res) => {
  try {
    const { firstname, lastname, username, email, password } = req.body;

    if (!firstname || !lastname || !username || !email || !password) {
      return res.status(400).json({ message: "All fields are required." });
    }

    const lowerEmail = email.trim().toLowerCase();

    const existingUser = await User.findOne({
      $or: [
        { email: lowerEmail },
        { username: username }
      ]
    });

    if (existingUser) {
      return res.status(409).json({
        message: existingUser.email === lowerEmail
          ? "Email already registered"
          : "Username already registered"
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const subid = await newUserID("User");

    const newUser = new User({
      firstname,
      lastname,
      accountStatus: "active",
      email: lowerEmail,
      password: hashedPassword,
      subid,
      username,
      role: "user"
    });
    await newUser.save();

    res.status(201).json({ message: "Registration successful" });

  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ================= GET PROFILE =====================
export const get_profile = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await User.findById(userId).lean();
    if (!user) return res.status(404).json({ message: "User not found" });

    const pins = await Pin.find({ user: userId }).lean();
    const pinCount = pins.length;

    let reportedPins = pins.filter(p => p.reportedBy === userId);
    let reportedPinCount = reportedPins.length;

    delete user.password;

    res.status(200).json({
      user,
      pins,
      pinCount,
      reportedPinCount,
      reportedPins
    });


  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server Error", error: err.message });
  }
};

export const get_users = async (req, res) => {
  try {
    const userRole = req.user.role;

    if (userRole !== "admin") {
      return res.status(403).json({ message: "You are not authorized" });
    }

    const users = await User.find({}, "-password").lean();

    res.status(200).json({ users });

  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server Error", error: err.message });
  }
};


export const set_user_role = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "You are not authorized" });
    }

    const userId = req.params.userId;
    const newRole = req.params.newRole; // "admin" أو "user"

    if (!["admin", "user"].includes(newRole)) {
      return res.status(400).json({ message: "Invalid role" });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.role === newRole) {
      return res.status(409).json({ message: `User is already ${newRole}` });
    }

    user.role = newRole;
    await user.save();

    res.status(200).json({
      message: `User with ID: ${user.subid} is now ${newRole}`,
      user
    });

  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server Error", error: err.message });
  }
};

export const del_user = async (req, res) => {
  try {
    const userRole = req.user?.role;

    if (!userRole || userRole.toLowerCase() !== "admin") {
      return res.status(403).json({ message: "You are not authorized" });
    }

    const userID = req.params.userid;

    if (!mongoose.Types.ObjectId.isValid(userID)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    const deletedUser = await User.findByIdAndDelete(userID);

    if (!deletedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ message: `User with ID: ${userID} has been deleted` });

  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server Error", error: err.message });
  }
};

export const leaderboard = async (req, res) => {
  try {
    const leaderboard = await User.find({})
      .select('lastname firstname username point')
      .sort({ point: -1 })
      .limit(10);

    return res.status(200).json({
      message: 'ok',
      leaderboard
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Server Error",
      error: err.message
    });
  }
};




export default { login, del_user, signup, get_profile, set_user_role, get_users, leaderboard };
