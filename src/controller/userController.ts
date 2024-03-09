import { Request, Response, NextFunction } from "express";
import { body, check, validationResult } from "express-validator";
import { CallbackError, Error, ObjectId } from "mongoose";
import { compare, hash } from "bcrypt";
import User, { UserType } from "../models/user";
import List, { ListType } from "../models/list";

/**
 * api call to create a user
 */
const user_create = [
  body('username', "Username must be longer than 4 character")
    .trim().isLength({min: 4}).escape(),
  check('username').custom(async (value: string) => {
    try {
      const theUser = await User.findOne({ name: value}).exec();
      if (!theUser) {
        return true;
      } else {
        throw new Error("username already exists");
      }
    } catch (error) {
      throw new Error("Error in finding username");
    }
  }),
  body('email', "Please enter a valid email address").normalizeEmail().isEmail().escape(),
  check('email').custom(async (value: string) => {
    try {
      const theUser = await User.findOne({ email: value}).exec();
      if (!theUser) {
        return true;
      } else {
        throw new Error("email address already exists");
      }
    } catch (error) {
      throw new Error("Error in finding email");
    }
  }),
  check('password').trim().isLength({min: 6})
  .withMessage('Passowrd must be longer than 6 letter').custom(value => {
      return /\d/.test(value)
  }).withMessage('Password must inclue numbers'),
  check('confirm_password', "Please enter the same password again").escape()
  .custom((value: string, { req }) => {
      return value === req.body.password;
  }),
  (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return next(errors.array);
    }
    hash(req.body.password, 10, async (err: Error | undefined, hashedPassword: string) => {
      if (err) {
        return next(err);
      }
      const user: UserType = new User({
        name: req.body.username as string,
        email: req.body.email as string,
        password: hashedPassword,
        list: [],
        date: new Date(),
      });
      try {
        await user.save();
        res.send({success: true, id: user._id});
      } catch (err) {
        return next(err as Error);
      }
    });
  }
]

const user_delete = [
  body('password').custom((value: string, { req }) => {
    return new Promise((resolve, reject) => {
      compare(value, (req.user as any).password, (err: Error | undefined, result: boolean) => {
          if (err || !result) {
              return reject('Incorrect password');
          }
          return resolve(true);
      });
    });
  }),
  async (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return next(errors.array());
    }
    try {
      const theUser = await User.findByIdAndDelete((req.user as UserType)._id);
      if (!theUser) {
        return next(new Error("no such user"));
      }
      res.send({success: true});
    } catch (error) {
      return next(error);
    }
  }
]

const user_edit = [
  body('username', "Username must be longer than 4 letter").trim().isLength({min: 4}).escape(),
  check('username').custom(async (value: string, { req }) => {
    try {
      const theUser = await User.findOne({name: value});
      if (!theUser || theUser._id.equals(req.user._id)) {
        return true;
      }
      throw new Error('Username already exists');
    } catch (error) {
      throw new Error("Error in finding user");
    }
  }),
  body('email', "Please enter a valid email address").normalizeEmail().isEmail().escape(),
  check('email').custom(async (value: string, { req }) => {
    try {
      const theUser = await User.findOne({email: value});
      if (!theUser || theUser._id.equals(req.user._id)) {
        return true;
      }
      throw new Error('Email address already exits');
    } catch (error) {
      throw new Error("Error in finding user");
    }
  }),
  async (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return next(errors.array());
    } else {
      try {
        const updatedUser = {
          name: req.body.username,
          email: req.body.email,
        };
        const newUser = await User.findByIdAndUpdate((req.user as UserType)._id, updatedUser, {});
        if (!newUser) {
          return next(new Error("Cannot find user"));
        }
        res.send({success: true, username: newUser.name});
      } catch (error) {
        return next(error);
      }
    }
  }
]

const user_get = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const theUser = await User.findById((req.user as UserType)._id);
    if (!theUser) {
      return next(new Error("No such user"));
    }
    res.send({
      success: true, 
      user: {
        username: theUser.name,
        email: theUser.email,
        list: theUser.list,
        date: theUser.date
      }
    });
  } catch (error) {
    return next(new Error("Error finding user"));
  }
}

const userController = {
  user_create,
  user_delete,
  user_edit,
  user_get,
}

export default userController;