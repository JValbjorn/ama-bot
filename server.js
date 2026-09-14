import express from "express";

const app = express();
const port = 3400;

app.set("view engine", "ejs");

const messages = [];
const answers = [
  {
    category: "navn",
    keywords: ["navn", "hedder", "hvem er du"],
    answer: [
      "Mit navn er Julie Valbjørn.",
      "Hej, Jeg er Julie.",
    ]},
  {
    category: "bosted",
    keywords: ["bor", "by", "fra"],
    answer: [
      "Jeg kommer oprinligt fra Ans by, som ligger ved tange sø.",
      "Nu bor jeg i Riskov, sammen med min kærste."
]},
  {
    category: "fritid",
    keywords: ["fritid", "hobby", "kan lide"],
    answer: [
      "I min fritid danser jeg West Coast Swing.", 
      "Når jeg føler mig kreativ kan jeg godt lide at hækkele eller strikke.",
    ],
  },
];

const topicStats = {
  navn: 0,
  bosted: 0,
  fritid: 0
};

function countMatches(keywords, normalizedQuestion) {
  const matches = keywords.filter((keyword) => normalizedQuestion.includes(keyword));
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
    category: bestCategory
  };
}

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
    messages.push({ type: "answer", text: result.answer, createdAt: new Date() });

    if (result.category) {
      topicStats[result.category] += 1;
    }
  }

app.post("/clear-messages", (request, response) => {
  messages.length = 0;
  response.redirect("/");
});

  response.render("index", { messages, error, topicStats});
});

function sanitizeQuestion(input) {
  return input.replace(/[\u0000-\u001F\u007F]/g, "");
}

// app.get("/debug", (request, response) => {
//   console.log(request.query);
//   response.send(request.query);
// });

// app.get("/debug/:name", (request, response) => {
//   console.log(request.params);
//   response.send(request.params);
// });

//------------------------------------route-------------------------------
app.get("/", (request, response) => {
  response.render("index", { messages, error: "", topicStats });
});

//-----------------------------middleware + skal gerne være nederest-----------------
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
