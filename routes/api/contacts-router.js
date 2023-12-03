import express from "express";

import contactControllers from "../../controllers/contacts-controllers.js"

import {isEmptyBody, isValidId} from "../../midllewares/index.js";

import validateBody from "../../decorators/validaterBody.js";
import { contactAddSchema, contactUpdateSchema, contactFavorireSchema } from "../../models/Contact.js";

const contactsRouter = express.Router()


contactsRouter.get('/', contactControllers.getAll)

contactsRouter.get('/:contactId',isValidId, contactControllers.getById)

contactsRouter.post('/', isEmptyBody,validateBody(contactAddSchema),  contactControllers.add)

contactsRouter.put('/:contactId', isValidId, isEmptyBody, validateBody(contactUpdateSchema), contactControllers.updateById)

contactsRouter.patch('/:contactId', isValidId, isEmptyBody, validateBody(contactFavorireSchema), contactControllers.updateById)
contactsRouter.delete('/:contactId',isValidId, contactControllers.deleteById)


export default contactsRouter;