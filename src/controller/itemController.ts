import { Request, Response, NextFunction } from "express";
import { body, validationResult } from "express-validator";
import { Error, Types } from "mongoose";
import Item, { ItemType } from "../models/item";
import { UserType } from "../models/user";
import List from "../models/list";

/**
 * api call to get the information from an item
 */
const item_get = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const theItem = await Item.findById(req.params.id);
    if (!theItem) {
      return next(new Error("No such item"));
    }
    res.send({
      success: true,
      item: theItem,
    });
  } catch (error) {
    return next(new Error("Error in finding item"));
  }
}

/**
 * api call to create a item
 */
const item_create = [
  body('name', 'item name must not be empty').trim().isLength({min: 1}).escape(),
  body('value', 'value must be a number').trim().isNumeric(),
  async (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return next(errors.array());
    } else {
      try {
        const newItem: ItemType = new Item({
          created: (req.user as UserType)._id as Types.ObjectId,
          name: req.body.name as string,
          value: req.body.value as number,
          belong: req.body.listID as Types.ObjectId,
          date: new Date(),
        });
        await newItem.save();
        res.send({ success: true, item: newItem });
      } catch (error) {
        return next(new Error("Error in creating item"));
      }
    }
  }
]

/**
 * api call to edit an item
 */
const item_edit = [
  body('name', 'item name must not be empty').trim().isLength({min: 1}).escape(),
  body('value', 'value must be a number').trim().isNumeric(),
  async (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return next(errors.array());
    } else {
      try {
        const updatedItem = {
          name: req.body.name,
          value: req.body.value,
          list: req.body.newListID,
        };
        const newItem = await Item.findByIdAndUpdate(req.body.itemID, updatedItem, {});
        if (!newItem) {
          return next(new Error("Error in updating item"));
        }
        res.send({ success: true, item: newItem });
      } catch (error) {
        return next(new Error("Error in updating item"));
      }
    }
  }
]

/**
 * api call to delete item and remove it from the list
 */
const item_delete = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const theItem = await Item.findById(req.params.id);
    if (!theItem) {
      return next(new Error("No such item"));
    }
    const theList = await List.findById(theItem.belong);
    if (!theList) {
      return next(new Error("No such list"));
    }
    await List.findByIdAndUpdate(theList._id, { $pull: {items: theItem._id} });
    await Item.findByIdAndDelete(theItem._id);
    res.send({ success: true });
  } catch (error) {
    return next(new Error("Error in deleting item"));
  }
}

const itemController = {
  item_get,
  item_create,
  item_edit,
  item_delete,
}

export default itemController;