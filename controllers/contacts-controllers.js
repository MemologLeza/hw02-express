import Contact from "../models/Contact.js";
 import { HttpError } from "../helpers/index.js";

import { ctrlWrapper } from "../decorators/index.js";

import { contactAddSchema, contactUpdateSchema } from "../models/Contact.js";

const getAll = async (req, res, next) => {
        const result = await Contact.find();
        res.json(result);
  
}

const getById = async (req, res, next) => {
    
        const { contactId } = req.params;
        const result = await Contact.findById(contactId);
        if (!result) {
             throw HttpError(404, `Contact with id=${contactId} not found`);
        }
        res.json(result);
}

const add = async(req, res, next)=> {
        const result = await Contact.create(req.body);
        res.status(201).json(result);
    }
    


const updateById = async(req, res, next)=> {
        const {contactId} = req.params;
        const result = await Contact.findByIdAndUpdate(contactId, req.body);
        if (!result) {
            throw HttpError(404, `Contact with id=${contactId} not found`);
        }

        res.json(result);

}

const deleteById = async(req, res, next)=> {
        const {contactId} = req.params;
        const result = await Contact.findByIdAndDelete(contactId);
        if (!result) {
            throw HttpError(404, `Contact with id=${contactId} not found`);
        }
        res.json({
            message: "contact deleted"
        })
}

export default {
    getAll: ctrlWrapper(getAll),
    getById: ctrlWrapper(getById),
    add: ctrlWrapper(add),
    updateById: ctrlWrapper(updateById),
    deleteById: ctrlWrapper(deleteById),
}