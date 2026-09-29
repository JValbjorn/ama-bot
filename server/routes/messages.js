import express from "express";
import { loadMessages, saveMessages } from "../data/messages.js";
import { loadAnswers } from "../data/answers.js";
import { findBestAnswer } from "../answerLogic.js";

const router = express.Router();

// --------------------------messages-routs-------------------------------------

router.get("/", async (request, response) => {
  const messages = await loadMessages();

  response.json(messages);
});

router.post("/", async (request, response) => {
  const question = request.body.question?.trim() ?? "";

  if (!question) {
    response.status(400).json({ error: "Skriv et spørgsmål, før du sender." });
    return;
  }

  const messages = await loadMessages();

  const message = {
    type: "question",
    text: question,
    createdAt: new Date().toISOString(),
  };

  messages.push(message);

  const answerGroups = await loadAnswers();
  const result = findBestAnswer(question, answerGroups);

  const answerMessage = {
    type: "answer",
    text: result.bestAnswer,
    createdAt: new Date().toISOString(),
  };
  messages.push(answerMessage);

  await saveMessages(messages);

  response.status(201).json({ question: message, answers: answerMessage });
});

router.delete("/", async (request, response) => {
  await saveMessages([]);

  response.status(204).send();
});

export default router;
