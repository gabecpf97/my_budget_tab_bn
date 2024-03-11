import { Request, Response, NextFunction } from "express";
import { body, validationResult } from "express-validator";
import { Error, Types } from "mongoose";
import List from "../models/list";
import User, { UserType } from "../models/user";
import Item from "../models/item";

/**
 * api call to get information of a list
 */
const list_get = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const theList = await List.findById(req.params._id);
    if (!theList) {
      return next(new Error("No such list"));
    }
    res.send({
      success: true,
      list: theList,
    });
  } catch (error) {
    return next(new Error("Erro in finding list"));
  }
}

/**
 * api call to create list
 */
const list_create = [
  body('name', 'list name must not be empty').trim().isLength({min: 1}).escape(),
  body('budget', 'budget must be a number').trim().isNumeric(),
  async (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()) {
      return next(errors.array());
    }
    try {
      const newList = new List({
        created: (req.user as UserType)._id as Types.ObjectId,
        name: req.body.name as string,
        date: new Date(),
        budget: req.body.budget as string,
        items: [],
      });
      await newList.save();
      res.send({ success: true, list: newList });
    } catch (error) {
      return next(new Error("Error in createing list"));
    }
  }
]

/**
 * api call to edit list
*/
const list_edit = [
  body('name', 'list name must not be empty').trim().isLength({min: 1}).escape(),
  body('budget', 'budget must be a number').trim().isNumeric(),
  async (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()) {
      return next(errors.array());
    }
    try {
      const updatedList = {
        name: req.body.name,
        budget: req.body.budget,
      }
      const newList = await List.findByIdAndUpdate(req.body.listId, updatedList, {});
      if (!newList) {
        return new Error("No such list exist");
      }
      res.send({ success: true, list: newList });
    } catch (error) {
      return next(new Error("Error in updating list"));
    }
  }
]

/**
 * api call to delete a list
 */
const list_delete = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const theList = await List.findById(req.params.id);
    if(!theList) {
      return next(new Error("No such list exists"));
    }
    const theUser = await User.findById((req.user as UserType)._id);
    if (!theUser) {
      return next(new Error("No such user"));
    }
    await User.findByIdAndUpdate(theUser._id, { $pull: {lists: theList._id} });
    await Item.deleteMany({ belong: theList._id });
    await List.findByIdAndDelete(theList._id);
    res.send({ success: true });
  } catch (error) {
    return next(new Error("Error in deleting list"));
  }
}

const listController = {
  list_get,
  list_create,
  list_edit,
  list_delete,
}

export default listController;