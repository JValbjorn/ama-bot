import express from "express";
import fs from "node:fs/promises";

const app = express();
const port = 3400;

app.use(express.json());

// ------------------henter/gemmer data fra messages.json-----------------------

async function loadMessages() {
  const data = await fs.readFile("./data/messages.json", "utf8");
  const messages = JSON.parse(data);

  for (const message of messages) {
    message.createdAt = new Date(message.createdAt);
  }

  return messages;
}

async function saveMessages(messages) {
  const json = JSON.stringify(messages, null, 2);
  await fs.writeFile("./data/messages.json", json);
}

// ------------------henter/gemmer data fra topic-stats.json-----------------------

async function loadTopicStats() {
  const data = await fs.readFile("./data/topic-stats.json", "utf8");
  return JSON.parse(data);
}

async function saveTopicStats(topicStats) {
  const json = JSON.stringify(topicStats, null, 2);
  await fs.writeFile("./data/topic-stats.json", json);
}

// ------------------henter/gemmer data fra answers.json-----------------------

async function loadAnswers() {
  const data = await fs.readFile("./data/answers.json", "utf8");
  return JSON.parse(data);
}

async function saveAnswers(answers) {
  const json = JSON.stringify(answers, null, 2);
  await fs.writeFile("./data/answers.json", json);
}

// -------------forbedringer--------------------

function countMatches(keywords, normalizedQuestion) {
  const matches = keywords.filter((keyword) =>
    normalizedQuestion.includes(keyword),
  );
  return matches.length;
}

function normalizeQuestion(question) {
  let normalizedQuestion = question.toLowerCase();
  return question.replace(/\s+/g, " ");
  //nok her jeg skal bruge dans regex?
}

function findBestAnswer(question) {
  const normalizedQuestion = normalizeQuestion(question);
  let bestScore = 0;
  let bestAnswer = "Det kender jeg ikke svaret på endnu.";
  let bestCategory = "";

  for (const answerGroup of answers) {
    const score = countMatches(answerGroup.keywords, normalizedQuestion);
    const randomIndex = Math.floor(Math.random() * answerGroup.answer.length);

    if (score > bestScore) {
      bestScore = score;
      bestAnswer = answerGroup.answer[randomIndex];
      bestCategory = answerGroup.category;
    }
  }

  return {
    answers: bestAnswer,
    category: bestCategory,
  };
}

function findMostAskedTopic(stats) {
  let highestCount = 0;
  let mostAskedTopic = "";

  for (const stat of Object.entries(stats)) {
    const category = stat[0];
    const count = stat[1];

    if (count > highestCount) {
      highestCount = count;
      mostAskedTopic = category;
    }
  }

  return mostAskedTopic;
}

function sanitizeQuestion(input) {
  return input.replace(/[\u0000-\u001F\u007F]/g, "");
}

// --------------------------messages-routs-------------------------------------

app.get("/messages", async (request, response) => {
  const messages = await loadMessages();

  response.json(messages);
});

app.post("/messages", async (request, response) => {
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

app.delete("/messages", async (request, response) => {
  await saveMessages([]);

  response.send();
});

// ----------------Answers-routs---------------------

app.get("/answers", async (request, response) => {
  const answers = await loadAnswers();

  response.json(answers);
});

app.get("/answers/:category", async (request, response) => {
  const answers = await loadAnswers();
  const answerRule = answers.find(
    (a) => a.category === request.params.category,
  );

  response.json(answerRule);
});

app.post("/answers", async (request, response) => {
  const answers = await loadAnswers();
  const newAnswerRule = {
    category: request.body.category,
    keywords: request.body.keywords,
    answers: request.body.answers,
  };

  answers.push(newAnswerRule);
  await saveAnswers(answers);

  response.json(newAnswerRule);
});

app.put("/answers/:category", async (request, response) => {
  const answers = await loadAnswers();
  const answerRule = answers.find(
    (a) => a.category === request.params.category,
  );

  answerRule.keywords = request.body.keywords;
  answerRule.answers = request.body.answers;
  await saveAnswers(answers);

  response.json(answerRule);
});

app.delete("/answers/:category", async (request, response) => {
  const answers = await loadAnswers();
  const updatedAnswers = answers.filter(
    (a) => a.category !== request.params.category,
  );
  
  await saveAnswers(updatedAnswers);

  response.send();
});

//-----------------------------middleware + skal gerne være nederest-----------------
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
