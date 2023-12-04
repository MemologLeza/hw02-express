import Contact from "../models/Contact.js";
 import { HttpError } from "../helpers/index.js";

import { ctrlWrapper } from "../decorators/index.js";

import { contactAddSchema, contactUpdateSchema } from "../models/Contact.js";

const getAll = async (req, res) => {
    const { _id: owner } = req.user;
    const { page = 1, limit = 10 , favorite} = req.query;
    const skip = (page - 1) * limit;
    const filteredBy = { owner };
    if (favorite !== undefined) {
        filteredBy.favorite = favorite;
    }
    const total = await Contact.countDocuments({owner});
    const result = await Contact.find({...filteredBy},"", { skip, limit}).populate("owner", "email subscription ");
        res.json({result, total, page});
  
}

const getById = async (req, res) => {
    
    const { contactId } = req.params;
    const { _id: owner } = req.user;
        const result = await Contact.findOne({_id:contactId, owner});
        if (!result) {
             throw HttpError(404, `Contact with id=${contactId} not found`);
        }
        res.json(result);
}

const add = async (req, res) => {
    const { _id: owner } = req.user;
        const result = await Contact.create({...req.body, owner});
        res.status(201).json(result);
    }
    


const updateById = async(req, res, next)=> {
    const { contactId } = req.params;
        const { _id: owner } = req.user;
    const result = await Contact.findOneAndUpdate({_id:contactId, owner }, req.body);
        if (!result) {
            throw HttpError(404, `Contact with id=${contactId} not found`);
        }

        res.json(result);

}

const deleteById = async(req, res, next)=> {
    const { contactId } = req.params;
            const { _id: owner } = req.user;

    const result = await Contact.findOneAndDelete({_id: contactId, owner });
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