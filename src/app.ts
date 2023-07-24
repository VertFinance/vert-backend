import { createServer } from "http"
import express from "express";
import morgan from "morgan";
import helmet from "helmet";
import cors from "cors";
import "./utils/setupEnv"

import banksRouter from "./routes/banks/banks.routes";
import setupSocket from "./sockets/setup.socket";


// express
const app = express();
app.use(morgan("tiny"));
app.use(helmet());
app.use(cors());

const PORT = 3001;

app.use("/banks", banksRouter);

app.get("/", (_, res) => {
  res.send("Welcome to Vert API");
})


//sockets
const httpServer = createServer(app);
setupSocket(httpServer);

httpServer.listen(PORT, () => {
  console.log("Listening on port: ", PORT)
})
