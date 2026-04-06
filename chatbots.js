import Groq from "groq-sdk";
import dotenv from "dotenv";
import readline from "readline";

dotenv.config();

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// this array holds the entire conversation — this IS the memory
const messages = [
  {
    role: "system",
    content: "You are a helpful AI assistant. Be clear, friendly and concise."
  }
];

// setup terminal input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log("Groq AI ready! Type 'quit' to exit.\n");

function chat() {
  rl.question("You: ", async (userInput) => {

    if (userInput.toLowerCase() === "quit") {
      console.log("Goodbye!");
      rl.close();
      return;
    }
    if (userInput.toLowerCase() === "history") {
    console.log("\n📜 Full Conversation History:");
    messages.forEach((msg, index) => {
        console.log(`${index}. [${msg.role.toUpperCase()}]: ${msg.content}`);
    });
    return chat(); // Ask for next input after showing history
}

    // add user message to history
    messages.push({ role: "user", content: userInput });

    // send full conversation to Groq
    const response = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: messages  // we send ALL messages every time — this is how memory works
    });

    const reply = response.choices[0].message.content;

    // add AI reply to history too
    messages.push({ role: "assistant", content: reply });
    console.log(messages);


    console.log(`\nGroq: ${reply}\n`);

    chat(); // ask for next input
  });
}

chat();