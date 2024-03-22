import { Request, Response, NextFunction } from "express";
import { body, check, validationResult } from "express-validator";
import { CallbackError, Error } from "mongoose";
import { compare, hash } from "bcrypt";
import User, { UserType } from "../models/user";
import passport from "passport";
import { sign } from "jsonwebtoken";

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
      return next(errors.array());
    }
    hash(req.body.password, 10, async (err: Error | undefined, hashedPassword: string) => {
      if (err) {
        return next(err);
      }
      const user: UserType = new User({
        name: req.body.username as string,
        email: req.body.email as string,
        password: hashedPassword,
        lists: [],
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

/**
 * api call to delete the user info from database
 */
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

/**
 * api call that change user's name and email
 */
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

/**
 * api call that get the user's information
 */
const user_get = async (req: Request, res: Response, next: NextFunction) => {
  console.log(`here: ${req.user}`);
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
        lists: theUser.lists,
        date: theUser.date
      }
    });
  } catch (error) {
    return next(new Error("Error finding user"));
  }
}

/**
 * api call for user to login
 */
const user_login = async (req: Request, res: Response, next: NextFunction) => {
  passport.authenticate('local', {session: false}, (err: CallbackError, theUser: UserType, info: any) => {
    if (err || !theUser) {
      return next(new Error(info.messagae));
    }
    req.login(theUser, {session: false}, (err: CallbackError) => {
      if (err) {
        return next(err);
      }
      const secreteKey = process.env.S_Key;
      if (secreteKey) {
        const token = sign({theUser}, secreteKey || "");
        res.send({ token });
      } else {
        return next(new Error("no secrete key"));
      }
    });
  })(req, res, next);
}

/**
 * api call to change user's password
 */
const user_changePassword = [
  body('password', "Passwrod is empty").trim().isLength({min: 1}).escape(),
  check('password').custom(async (value: string, { req }) => {
    try {
      const theUser = await User.findById((req.user as UserType)._id);
      if (!theUser) {
        throw new Error("No such user");
      }
      const result = await compare(value, theUser.password as string)
        if (!result) {
          throw new Error("Password incorrect");
        } else {
          return true;
        }
    } catch (error) {
      throw new Error("Error finding user");
    }
  }),
  check('newPassword').trim().isLength({min: 6})
  .withMessage('Passowrd must be longer than 6 letter').custom(value => {
      return /\d/.test(value)
  }).withMessage('Password must inclue numbers'),
  check('confirm_newPassword', "Please enter the same password again").escape()
  .custom((value: string, { req }) => {
      return value === req.body.password;
  }),
  (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      next(errors.array());
    } else {
      hash(req.body.newPassword, 10, async (err: Error | undefined, hashedPassword: string) => {
        if (err) {
          return next(err);
        }
        try {
          const theUser = await User.findByIdAndUpdate((req.user as UserType)._id, 
                                  {password: hashedPassword}, {});
          if(!theUser) {
            return next(new Error("No such user"));
          }
          res.send({success: true});
        } catch (error) {
          return next(error);
        }
      })
    }
  }
]

const userController = {
  user_create,
  user_delete,
  user_edit,
  user_get,
  user_login,
  user_changePassword,
}

export default userController;