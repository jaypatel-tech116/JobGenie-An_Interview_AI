const userModel = require("../models/user.model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const tokenBlacklistModel = require("../models/blacklist.model");

const admin = require("../config/firebaseAdmin");

/**
 * @name registerUserCountroller
 * @description Register a new user, expects username, email and password in the request body
 * @access Public
 */
async function registerUserController(req, res) {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide username, email and password.",
      });
    }
    const isUserAlreadyExists = await userModel.findOne({
      $or: [{ username }, { email }],
    });

    if (isUserAlreadyExists) {
      if (isUserAlreadyExists.username === username) {
        return res.status(400).json({
          success: false,
          message: "Username already taken.",
        });
      }

      if (isUserAlreadyExists.email === email) {
        return res.status(400).json({
          success: false,
          message: "Account already exists with this email address.",
        });
      }
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await userModel.create({
      username,
      email,
      password: hashedPassword,
      provider: "local",
    });

    const token = jwt.sign(
      {
        id: user._id,
        username: user.username,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" },
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    });

    return res.status(201).json({
      success: true,
      message: "User registered successfully",
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
}

/**
 * @name loginUserCountroller
 * @description Login a user, expects email and password in the request body
 * @access Public
 */

async function loginUserController(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide email and password.",
      });
    }
    const user = await userModel.findOne({ email });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    if (user.provider === "google") {
      return res.status(400).json({
        success: false,
        message: "Please login using Google.",
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(400).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    const token = jwt.sign(
      {
        id: user._id,
        username: user.username,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" },
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      success: true,
      message: "User loggedIn successfully.",
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
}

/**
 * @name logoutUserCountroller
 * @description Clear token from user cookie and add the token in blacklist
 * @access Public
 */

async function logoutUserController(req, res) {
  try {
    const token = req.cookies?.token;

    if (token) {
      await tokenBlacklistModel.create({ token });
    }

    res.clearCookie("token", {
      httpOnly: true,
      secure: true,
      sameSite: "none",
    });

    return res.status(200).json({
      success: true,
      message: "User logged out successfully.",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
}

/**
 * @name googleAuthController
 * @description Register or login using google
 * @access Public
 */
async function googleAuthController(req, res) {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: "Token required",
      });
    }

    console.log("Incoming token:", token);

    // ✅ Verify Firebase token
    const decoded = await admin.auth().verifyIdToken(token);

    console.log("Decoded user:", decoded);

    const { email, name, picture, uid } = decoded;

    // ✅ Check user
    let user = await userModel.findOne({
      $or: [{ email }, { googleId: uid }],
    });

    // 🧠 Merge existing account
    if (user && !user.googleId) {
      user.googleId = uid;
      user.provider = "google";
      user.avatar = picture || user.avatar;
      await user.save();
    }

    // 🆕 Create new user
    if (!user) {
      user = await userModel.create({
        username: name,
        email,
        avatar: picture,
        provider: "google",
        googleId: uid,
        isEmailVerified: true,
      });
    }

    // ✅ Create YOUR JWT
    const appToken = jwt.sign(
      {
        id: user._id,
        username: user.username,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" },
    );

    res.cookie("token", appToken, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      success: true,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(401).json({
      success: false,
      message: "Invalid Google token",
    });
  }
}

/**
 * @name getMeController
 * @description Get current logged in user details
 * @access Private
 */
async function getMeController(req, res) {
  try {
    const user = await userModel.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "User Details fetched successfully.",
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
}

module.exports = {
  registerUserController,
  loginUserController,
  logoutUserController,
  googleAuthController,
  getMeController,
};
