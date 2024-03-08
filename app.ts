import express, { Application, Request, Response, NextFunction } from "express";
import { CallbackError, Connection, Error, connect, connection } from "mongoose";
import logger from "morgan";
import cors from "cors";

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