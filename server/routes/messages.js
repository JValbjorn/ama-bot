import express from "express";
import { loadMessages, saveMessages } from "../data/messages.js"
import { findBestAnswer } from "../answerLogic.js"

const router = express.Router();

// --------------------------messages-routs-------------------------------------

router.get("/", async (request, response) => {
  const messages = await loadMessages();

  response.json(messages);
});

router.post("/", async (request, response) => {
  const messages = await loadMessages();
  const question = request.body.question.trim();

  if (!question) {
    response.json({ error: "Skriv et spørgsmål, før du sender." });
    return;
  }

  const message = {
    type: "question",
    text: question,
    createdAt: new Date().toISOString(),
  };
  messages.push(message);

  const result = findBestAnswer(question);
  const answerMessage = {
    type: "answer",
    text: result.answers,
    createdAt: new Date().toISOString(),
  };
  messages.push(answerMessage);

  await saveMessages(messages);

  response.json({ question: message, answers: answerMessage });
});

router.delete("/", async (request, response) => {
  await saveMessages([]);

  response.send();
});


export default router;