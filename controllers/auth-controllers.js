import bcrypt from "bcrypt";
import User from "../models/User.js";
import jwt from "jsonwebtoken";
import gravatar from "gravatar";
import Jimp from "jimp";
import fs from "fs/promises"
import path from "path";
import { nanoid } from "nanoid";
import { HttpError, sendEmail } from "../helpers/index.js";
import { ctrlWrapper } from "../decorators/index.js";
import {subscriptionType} from "../models/User.js"

const { JWT_SECRET, BASE_URL } = process.env;
const avatarPath = path.resolve("public", "avatars");

const register = async (req, res) => {
    const { email, password } = req.body;
    const newUser = await User.findOne({ email });
    if (newUser) {
        throw HttpError(409, "Email in use"); 
    }
    const hashPassword = await bcrypt.hash(password, 10);
    const avatarURL = gravatar.url(email, { s: "250", d: "retro" });
    const verificationToken = nanoid();
    const user = await User.create({ ...req.body, avatarURL, password: hashPassword, verificationToken });
    const verifyEmail = {
        to: email,
        subject: "Verify your email",
        html:`<a target="_blank" href="${BASE_URL}/users/verify/${verificationToken}">Click to verify your email</a>`
    }
    await sendEmail(verifyEmail);
    res.status(201).json({
        user: {
            email: user.email,
            subscription: user.subscription,
            avatarURL,
        }
    })
};

const verify = async (req, res) => {
    const { verificationToken } = req.params;
    const user = await User.findOne({ verificationToken });
    if (!user) {
        throw HttpError(404, "User not found");
    };
    console.log('user._id', user);
    await User.findByIdAndUpdate(user._id, { verify: true, verificationToken: "" });
    res.json({
        message: "Verification successful"
    })

};

const resendVerify = async (req, res) => {
    const { email } = req.body;
    const user = await User.findOne({email});
    if (!user) {
        throw HttpError(401, "User not found");
    };
    if (user.verify) {
        throw HttpError(400, "Verification has already been passed");
    };
    const verifyEmail = {
        to: email,
        subject: "Verify your email",
        html:`<a target="_blank" href="${BASE_URL}/users/verify/${user.verificationToken}">Click to verify your email</a>`
    }
    await sendEmail(verifyEmail);
    res.json({
        message:"Verification email sent"
    })
}

const login = async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({email});
    if (!user) {
        throw HttpError(401, "Email or password is wrong");
    };
    const passwordCompare = await bcrypt.compare(password, user.password);
    if (!passwordCompare) {
        throw HttpError(401, "Email or password is wrong");
    }
    if (!user.verify) {
        throw HttpError(401, "Email is not verify");
    }
    const payload = {
        id: user._id,
    }
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "23h" });
    await User.findByIdAndUpdate(user._id, { token });
    res.json({ token,  user: {
            email: user.email,
            subscription: user.subscription
        } });

}
const logout = async (req, res) => {
    const { _id } = req.user;
    await User.findByIdAndUpdate(_id, { token: "" });
    return res.status(204).json();
   
}
const getCurrent = async (req, res) => {
    const { email, subscription } = req.user;
    res.json({email, subscription});
}
const subscriptionUpdate = async (req, res) => {
    const { _id, email } = req.user;
    const {subscription} = req.body;
    if (!subscriptionType.includes(subscription)) {
        
        throw HttpError(400, "Invalid subscription type");
    };
     await User.findByIdAndUpdate(_id, subscription);
    res.json(  {
            email,
            subscription
        } );
}
const avatarUpdate = async (req, res) => {
    if (!req.file) {
        throw HttpError(401, "File fild is empty")
    }
    const { _id } = req.user;
    const { path: oldPath, filename } = req.file;
	const newPath = path.join(avatarPath, filename);
	(await Jimp.read(oldPath)).resize(250, 250).write(oldPath);
	await fs.rename(oldPath, newPath);
    const avatarURL = path.join('avatars', filename);
    await User.findByIdAndUpdate(_id, {avatarURL});
	res.json({avatarURL});
}
export default {
    register: ctrlWrapper(register),
    login: ctrlWrapper(login),
    logout: ctrlWrapper(logout),
    getCurrent: ctrlWrapper(getCurrent),
    subscriptionUpdate: ctrlWrapper(subscriptionUpdate),
    avatarUpdate: ctrlWrapper(avatarUpdate),
    verify: ctrlWrapper(verify),
    resendVerify: ctrlWrapper(resendVerify),
}