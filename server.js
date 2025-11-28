import express from "express";
import cors from "cors";
import cookieParser from 'cookie-parser';
import authenticateToken from './middlewares/authenticateToken.js';
import startDatabase from "./config/database.js";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());


app.use(cors({
  origin: (origin, callback) => {
    callback(null, true);
  },
  credentials: true
}));


import UserRouter from "./routes/userRouter.js";
app.use("/v1/user", UserRouter);

const port = process.env.PORT || 8080;

app.get('/', (req, res) => {
  res.send('Hello World!')
})


startDatabase().then(() => {
  app.listen(port, () => {
    console.log(`🚀 Server running on http://localhost:${port}`);
  });
});
