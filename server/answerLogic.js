import { loadAnswers } from "./data/answers.js";

function countMatches(keywords, normalizedQuestion) {
  const matches = keywords.filter((keyword) =>
    normalizedQuestion.includes(keyword),
  );
  return matches.length;
}

function normalizeQuestion(question) {
  let normalizedQuestion = question.toLowerCase();
  return normalizedQuestion.replace(/\s+/g, " ");
  //nok her jeg skal bruge dans regex?
}

export function findBestAnswer(question, answerGroups) {
  const normalizedQuestion = normalizeQuestion(question);
  let bestScore = 0;
  let bestAnswer = "Det kender jeg ikke svaret på endnu.";
  let bestCategory = "";

  for (const answerGroup of answerGroups) {
    const score = countMatches(answerGroup.keywords, normalizedQuestion);
    const randomIndex = Math.floor(Math.random() * answerGroup.answers.length);

    if (score > bestScore) {
      bestScore = score;
      bestAnswer = answerGroup.answers[randomIndex];
      bestCategory = answerGroup.category;
    }
  }

  return {
    bestAnswer: bestAnswer,
    category: bestCategory,
  };
}

// function findMostAskedTopic(stats) {
//   let highestCount = 0;
//   let mostAskedTopic = "";

//   for (const stat of Object.entries(stats)) {
//     const category = stat[0];
//     const count = stat[1];

//     if (count > highestCount) {
//       highestCount = count;
//       mostAskedTopic = category;
//     }
//   }

//   return mostAskedTopic;
// }

// function sanitizeQuestion(input) {
//   return input.replace(/[\u0000-\u001F\u007F]/g, "");
// }
