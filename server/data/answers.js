import fs from "node:fs/promises";

// ------------------henter/gemmer data fra answers.json-----------------------

export async function loadAnswers() {
  try {
    const data = await fs.readFile("./data/answers.json", "utf8");
    return JSON.parse(data);
  } 
  catch (error) {
    throw new Error(
      "Kunne ikke hente answers. data/answers.json mangler eller er ugyldig.",
    );
  }
}

export async function saveAnswers(answers) {
  const json = JSON.stringify(answers, null, 2);
  await fs.writeFile("./data/answers.json", json);
}
