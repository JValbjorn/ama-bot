import express from "express";
import cors from "cors";
import messagesRouter from "./routes/messages.js";
import answersRouter from "./routes/answers.js";

const app = express();
const port = 3400;

app.use(express.json());
app.use(cors());

app.use("/messages", messagesRouter);
app.use("/answers", answersRouter);

//-----------------------------middleware + skal gerne være nederest-----------------
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
