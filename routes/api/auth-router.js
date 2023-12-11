import express from "express";

import authControllers from "../../controllers/auth-controllers.js";

import {authenticate, isEmptyBody, upload } from "../../midllewares/index.js";

import validateBody from "../../decorators/validaterBody.js";

import { singinSchema, singupSchema } from "../../models/User.js";

const authRouter = express.Router();

authRouter.post("/register", isEmptyBody, validateBody(singupSchema), authControllers.register);
authRouter.post("/login", isEmptyBody, validateBody(singinSchema), authControllers.login); 
authRouter.get("/current", authenticate, authControllers.getCurrent);
authRouter.post("/logout", authenticate, authControllers.logout);   
authRouter.patch("/", authenticate, authControllers.subscriptionUpdate);
authRouter.patch("/avatar", upload.single("avatar"), authenticate, authControllers.avatarUpdate)

export default authRouter;