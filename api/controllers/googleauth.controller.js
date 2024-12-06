// Import dependencies and modules
import axios from "axios";
import jwt from "jsonwebtoken";
import { asyncHandler,oauth2Client,ApiError,ApiResponse } from "../utils/utils.js";
import { User } from "../models/User.models.js";

// Sign token function
const signToken = (id) => {
  return jwt.sign({ id }, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
  });
};

// Create and send cookie function
const createSendToken = (user,access_token, statusCode, res) => {
  const token = signToken(user.id);
  console.log("TOKEN: ",token)
  const accessToken=access_token

  const cookieOptions = {
    httpOnly: true,
    // path: "/",
    secure: true,
    // secure: process.env.NODE_ENV === "production",
    // sameSite: process.env.NODE_ENV === "production" ? "none" : undefined,
  };

  user.password = undefined;

  return res.status(200).cookie("jwt", token, cookieOptions).json({
    message: "success",
    token,
    data: {
      accessToken,
      user,
    },
  });
};

// Google Authentication handler
const googleAuth = asyncHandler(async (req, res) => {
  const code = req.query.code;
  console.log("USER CREDENTIAL -> ", code);

  const googleRes = await oauth2Client.getToken(code);
  oauth2Client.setCredentials(googleRes.tokens);

  const userRes = await axios.get(
    `https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${googleRes.tokens.access_token}`
  );
  const allowedEmails = ["ipecacmsigweb@gmail.com"];
  if (!allowedEmails.includes(userRes.data.email)) {
    return res.status(403).json({
      message: "Access denied. Only SIG WEB email is allowed.",
    });
  }
  let user = await User.findOne({ email: userRes.data.email });

  if (!user) {
    console.log("New User found");
    const newUser = User({
      name: userRes.data.name,
      email: userRes.data.email,
      image: userRes.data.picture,
    })
    await newUser.save()

  }
  console.log(user)
  console.log(googleRes.tokens.access_token)

  return res.status(200).json({
    message:"HELLO WORLD",
    data:{
      user:user??newUser,
      accessToken:googleRes.tokens.access_token
    }
  })
  // createSendToken(user,googleRes.tokens.access_token, 201, res);
});

export default googleAuth;
