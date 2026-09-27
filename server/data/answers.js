import fs from "node:fs/promises";

// ------------------henter/gemmer data fra answers.json-----------------------

export async function loadAnswers() {
  const data = await fs.readFile("./data/answers.json", "utf8");
  return JSON.parse(data);
}

export async function saveAnswers(answers) {
  const json = JSON.stringify(answers, null, 2);
  await fs.writeFile("./data/answers.json", json);
}
