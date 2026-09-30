import express from "express";
import { loadAnswers, saveAnswers } from "../data/answers.js";

const router = express.Router();

// ----------------Answers-routs---------------------

router.get("/", async (request, response) => {
  const answers = await loadAnswers();

  response.json(answers);
});

router.get("/:category", async (request, response) => {
  const answerGroup = await loadAnswers();
  const answerRule = answerGroup.find(
    (a) => a.category === request.params.category,
  );

  if (!answerRule) {
    response
      .status(404)
      .json({ error: "Der findes ikke nogle svar med den kategori" });
    return;
  }

  response.json(answerRule);
});

router.post("/", async (request, response) => {
  const answers = await loadAnswers();

  if (!request.body.answers || !request.body.keywords || !request.body.category) {
    response.status(400).json({
      error:
        "Der mangler information, keywords, kategori og awnsers skal beggge udfyldes.",
    });
    return;
  }

  const newAnswerRule = {
    category: request.body.category,
    keywords: request.body.keywords,
    answers: request.body.answers,
  };

  answers.push(newAnswerRule);
  await saveAnswers(answers);

  response.status(201).json(newAnswerRule);
});

router.put("/:category", async (request, response) => {
  const answers = await loadAnswers();
  const answerRule = answers.find(
    (a) => a.category === request.params.category,
  );

  if (!answerRule) {
    response.status(404).json({ error: "Ingen svar for den kategori" });
    return;
  }

  if (!request.body.answers || !request.body.keywords) {
    response.status(400).json({
      error:
        "Der mangler information, keywords og awnsers skal beggge udfyldes.",
    });
    return;
  }

  answerRule.keywords = request.body.keywords;
  answerRule.answers = request.body.answers;
  await saveAnswers(answers);

  response.json(answerRule);
});

router.delete("/:category", async (request, response) => {
  const answers = await loadAnswers();
  const updatedAnswers = answers.filter(
    (a) => a.category !== request.params.category,
  );

  if (!updatedAnswers) {
    response.status(404).json({ error: "Ingen svar for den kategori" });
    return;
  }

  awnsers = answers.filter((a) => a.category !== request.params.category);
  await saveAnswers(updatedAnswers);

  response.status(204).send();
});

export default router;
