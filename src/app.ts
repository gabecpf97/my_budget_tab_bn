import express, { Application, Request, Response, NextFunction } from "express";
import { Connection, Error, connect, connection } from "mongoose";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Strategy as JWTStrategy, ExtractJwt } from "passport-jwt";
import { compare } from "bcrypt";
import User from "./models/user";
import logger from "morgan";
import cors from "cors";
import router from "./route";
import dotenv from "dotenv";
dotenv.config();

passport.use(new LocalStrategy(
  {
    usernameField: "email",
    passwordField: "password",
  }, async (email: string, password: string, done: Function) => {
    try {
      const theUser = await User.findOne({ email });
      if (!theUser) {
        return done(null, false, {message: "Email address does not exists"});
      } else {
        compare(password, theUser.password as string, 
          (err: Error | undefined, result: boolean) => {
            if (err) {
              return done(err);
            }
            if (!result) {
              return done(null, false, {message: 'Password incorrect'});
            }
            return done(null, theUser);
        });
      }
    } catch (error) {
      return done(error);
    }
  }
));

passport.use(new JWTStrategy(
  {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.S_Key as string,
  },
  async (jwtPayload: any, cb: Function) => {
    try {
      const theUser = await User.findById(jwtPayload.theUser._id);
      if (!theUser) {
        return cb(new Error("Please sign in or sign up"), false);
      }
      cb(null, theUser);
    } catch (error) {
      return cb(error, false);
    }
  }
));

const app: Application = express();

const mongoDB = `mongodb+srv://admin:${process.env.DB_Pass}@cluster0.dasxxcn.mongodb.net/?retryWrites=true&w=majority`;
connect(mongoDB);
const db: Connection = connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

app.use(cors());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({extended: false}));

app.use('/', router);

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  res.status(500);
  if (err.message) {
    return res.send({err: err.message});
  }
  res.send({err});
});

app.listen(process.env.PORT, () => {
  console.log(`server is running on port ${process.env.PORT}`);
})