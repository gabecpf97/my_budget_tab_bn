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
      throw new Error("Error in find email");
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