import express from "express";

const app = express();
const port = 3400;

app.set("view engine", "ejs");

const messages = [];
const answers = [
  {
    keywords: ["navn", "hedder", "hvem er du"],
    answers: [
      "Mit navn er Julie Valbjørn.", 
      "Hej, Jeg er Julie.", 
    ]},
  {
    keywords: ["bor", "by", "fra"],
    answers: [
      "Jeg kommer oprinligt fra Ans by, som ligger ved tange sø.", 
      "Nu bor jeg i Riskov, sammen med min kærste."
]},
  {
    keywords: ["fritid", "hobby", "kan lide"],
    answers: [
      "I min fritid danser jeg West Coast Swing. ", 
      "Når jeg føler mig kreativ kan jeg godt lide at hækkele eller strikke.",
  ]},
];

function findAnswer(question) {
  const normalizedQuestion = question.toLowerCase();

  for (const answerGroup of answers) {
    const hasMatch = answerGroup.keywords.some((keyword) =>
      normalizedQuestion.includes(keyword),
    );

    if (hasMatch) {
      const randomIndex = Math.floor(Math.random() * answerGroup.answers.length);
      return answerGroup.answers[randomIndex];
    }
  }

  

  return "Det kender jeg ikke svaret på endnu.";
}

console.log(findAnswer("Hvad hedder du?"));

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
    const answer = findAnswer(question);
    messages.push({ type: "answer", text: answer, createdAt: new Date() });
  }

  app.post("/clear-messages", (request, response) => {
  messages.length = 0;
  response.redirect("/");
});

  response.render("index", { messages, error });
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
  response.render("index", { messages, error: "" });
});

//-----------------------------middleware + skal gerne være nederest-----------------
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
