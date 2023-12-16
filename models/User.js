import { Schema, model } from "mongoose";
import Joi from 'joi';
import { handleSaveError, preUpdate } from "./hooks.js"

const emailRegexp = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
export const subscriptionType = ["starter", "pro", "business"];
const userSchema = new Schema({
    password: {
        type: String,
        minLength: 6,
        required: [true, 'Set password for user'],
    },
    email: {
        type: String,
        match: emailRegexp,
        required: [true, 'Email is required'],
        unique: true,
    },
    subscription: {
        type: String,
        enum: subscriptionType,
        default: "starter"
    },
    avatarURL: {
        type: String
    },
    verify: {
        type: Boolean,
        default: false
    },
    verificationToken: {
        type: String
    },
    token: String,
}, { versionKey: false });

userSchema.pre("findOneAndUpdate", preUpdate)
userSchema.post("save", handleSaveError)
userSchema.post("findOneAndUpdate", handleSaveError)

export const singupSchema = Joi.object({
    email: Joi.string().pattern(emailRegexp).required(),
    password: Joi.string().min(6).required(),
    subscription: Joi.string().valid(...subscriptionType)
});
export const singinSchema = Joi.object({
    email: Joi.string().pattern(emailRegexp).required(),
    password: Joi.string().min(6).required(),
});
export const emailSchema = Joi.object({
    email:Joi.string().pattern(emailRegexp).required(),
})

const User = model("user", userSchema);
export default User;