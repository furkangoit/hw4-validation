import { Contact } from "../models/contact.js";
import createError from "http-errors";

// GET /contacts  → sayfalandırma + sıralama + filtreleme
export const getAllContacts = async (req, res, next) => {
  try {
    const { page = 1, perPage = 10, sortBy = "name", sortOrder = "asc", type, isFavourite } = req.query;

    const findCriteria = {};
    if (type) {
      findCriteria.contactType = type;
    }
    if (isFavourite !== undefined) {
      findCriteria.isFavourite = isFavourite === "true"; 
    }

    const limit = parseInt(perPage, 10);
    const skip = (parseInt(page, 10) - 1) * limit;

    const totalItems = await Contact.countDocuments(findCriteria);
    const totalPages = Math.ceil(totalItems / limit);
    const hasPreviousPage = parseInt(page, 10) > 1;
    const hasNextPage = parseInt(page, 10) < totalPages;

    const sortOrderValue = sortOrder === "desc" ? -1 : 1;

    const contacts = await Contact.find(findCriteria)
      .sort({ [sortBy]: sortOrderValue })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      status: 200,
      message: "Successfully found contacts!",
      data: {
        data: contacts,
        page: parseInt(page, 10),
        perPage: limit,
        totalItems,
        totalPages,
        hasPreviousPage,
        hasNextPage,
      },
    });
  } catch (error) {
    next(error);
  }
};

// GET /contacts/:id
export const getContactById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const contact = await Contact.findById(id);
    if (!contact) {
      return next(createError(404, "Contact not found"));
    }
    res.status(200).json({
      status: 200,
      message: `Successfully found contact with id ${id}!`,
      data: contact,
    });
  } catch (error) {
    next(error);
  }
};

// POST /contacts
export const createContact = async (req, res, next) => {
  try {
    const newContact = await Contact.create(req.body);
    res.status(201).json({
      status: 201,
      message: "Successfully created a contact!",
      data: newContact,
    });
  } catch (error) {
    next(error);
  }
};

// PATCH /contacts/:id
export const updateContact = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updatedContact = await Contact.findByIdAndUpdate(id, req.body, { new: true });

    if (!updatedContact) {
      throw createError(404, "Contact not found");
    }

    res.status(200).json({
      status: 200,
      message: "Successfully updated a contact!",
      data: updatedContact,
    });
  } catch (error) {
    next(error);
  }
};

// DELETE /contacts/:id
export const deleteContact = async (req, res, next) => {
  try {
    const { id } = req.params;
    const deletedContact = await Contact.findByIdAndDelete(id);
    if (!deletedContact) {
      return next(createError(404, "Contact not found"));
    }
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};