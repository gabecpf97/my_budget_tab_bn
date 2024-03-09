import express, { Application, Request, Response, NextFunction } from "express";
import { CallbackError, Connection, Error, connect, connection } from "mongoose";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Strategy as JWTStrategy, ExtractJwt } from "passport-jwt";
import { compare } from "bcrypt";
import User, { UserType } from "./src/models/user";
import logger from "morgan";
import cors from "cors";

passport.use(new LocalStrategy(
  {
    usernameField: "email",
    passwordField: "password",
  }, async (email: string, password: string, done: Function) => {
    try {
      const theUser = await User.findOne({ email });
      if (!theUser) {
        return done(null, false, {messagae: "Email address does not exists"});
      } else {
        compare(password, theUser.password as string, 
          (err: Error | undefined, result: boolean) => {
            if (err) {
              return done(err);
            }
            if (!result) {
              return done(null, false, { message: 'Password incorrect'});
            }
            done(null, theUser);
        });
      }
    } catch (error) {
      return done(error);
    }
  }
));

const app: Application = express();

const mongoDB = ``;
connect(mongoDB);
const db: Connection = connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

app.use(cors());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({extended: false}));

app.use('/');

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  res.status(500);
  if (err.message) {
    return res.send({err: err.message});
  }
  res.send({err});
});

app.listen(5000, () => {
  console.log('server is running on port 5000');
})