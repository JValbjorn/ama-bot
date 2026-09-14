import express from "express";
import { answers } from "./data/answers.js";

const app = express();
const port = 3400;

app.set("view engine", "ejs");

const messages = [];

const topicStats = {
  navn: 0,
  bosted: 0,
  fritid: 0,
  film: 0,
  musik: 0,
  spil: 0,
  dans: 0,
  ukendt: 0,
};

function countMatches(keywords, normalizedQuestion) {
  const matches = keywords.filter((keyword) =>
    normalizedQuestion.includes(keyword),
  );
  return matches.length;
}

function findBestAnswer(question) {
  const normalizedQuestion = question.toLowerCase();
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
    answer: bestAnswer,
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

// function reactionFor(category) {
//   switch (category) {
//     case "navn":
//       return "👋";
//     case "bosted":
//       return "🏠";
//     case "fritid":
//       return "🎉";
//     default:
//       return "🤖";
//   }
// }

// function findAnswer(question) {
//   const normalizedQuestion = question.toLowerCase();

//   for (const answerGroup of answers) {
//     const hasMatch = answerGroup.keywords.some((keyword) =>
//       normalizedQuestion.includes(keyword),
//     );

//     if (hasMatch) {
//       const randomIndex = Math.floor(Math.random() * answerGroup.answers.length);
//       return answerGroup.answers[randomIndex];
//     }
//   }

//   return "Det kender jeg ikke svaret på endnu.";
// }

//------------------middleware-----------

app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));

app.post("/ask", (request, response) => {
  const rawQuestion = request.body.question;
  const question = sanitizeQuestion(rawQuestion).trim();
  let error = "";

  if (!question) {
    error = "Skriv et spørgsmål, før du sender.";
  } else if (question.length > 280) {
    error = "Spørgsmålet må højst være 280 tegn.";
  } else {
    messages.push({ type: "question", text: question, createdAt: new Date() });

    const result = findBestAnswer(question);
    const reaction = reactionFor(result.category);
    messages.push({
      type: "answer",
      text: `${reaction} ${result.answer}`,
      createdAt: new Date(),
    });

    if (result.category) {
      topicStats[result.category] += 1;
    } else {
      topicStats.ukendt += 1;
    }
  }

  app.post("/clear-messages", (request, response) => {
    messages.length = 0;
    response.redirect("/");
  });

  const mostAskedTopic = findMostAskedTopic(topicStats);

  response.render("index", { messages, error, topicStats, mostAskedTopic });
});

function sanitizeQuestion(input) {
  return input.replace(/[\u0000-\u001F\u007F]/g, "");
}

app.post("/clear-stats", (request, response) => {
  for (const category of Object.keys(topicStats)) {
    topicStats[category] = 0;
  }

  response.redirect("/");
});

//------------------------------------route-------------------------------
app.get("/", (request, response) => {
  const mostAskedTopic = findMostAskedTopic(topicStats);

  response.render("index", { messages, error: "", topicStats, mostAskedTopic });
});

//-----------------------------middleware + skal gerne være nederest-----------------
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
