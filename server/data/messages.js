import fs from "node:fs/promises";

// ------------------henter/gemmer data fra messages.json-----------------------

export async function loadMessages() {
  try {
    const data = await fs.readFile("./data/messages.json", "utf8");
    const messages = JSON.parse(data);

    for (const message of messages) {
      message.createdAt = new Date(message.createdAt);
    }

    return messages;
  } catch (error) {
    throw new Error(
      "Kunne ikke hente messages. data/messages.json mangler eller er ugyldig.",
    );
  }
}

export async function saveMessages(messages) {
  const json = JSON.stringify(messages, null, 2);
  await fs.writeFile("./data/messages.json", json);
}
