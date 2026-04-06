import Groq from "groq-sdk";
import dotenv from "dotenv";
import readline from "readline";

dotenv.config();

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// ============================================
// THE SYSTEM PROMPT — this is your product
// ============================================
const SYSTEM_PROMPT = `
You are Bella, a friendly customer support assistant for Pizza Palace — 
a pizza restaurant in Karachi, Pakistan.

MENU:
- Margherita Pizza (small: Rs.499, large: Rs.899)
- BBQ Chicken Pizza (small: Rs.649, large: Rs.1099)
- Veggie Supreme Pizza (small: Rs.549, large: Rs.949)
- Garlic Bread: Rs.199
- Soft Drinks: Rs.99

HOURS: Open daily 12pm to 12am
LOCATION: Block 5, Clifton, Karachi
DELIVERY: Free delivery on orders above Rs.1000. Otherwise Rs.150 charge.
ORDER PHONE: 0300-1234567

YOUR RULES:
1. Be warm, friendly and helpful — like talking to a real person
2. Only answer questions related to Pizza Palace
3. If someone asks something unrelated (politics, coding, etc), politely say 
   "I can only help with Pizza Palace related questions! 😊"
4. Never make up prices or information not listed above
5. If unsure about something, say "Let me connect you to our team at 0300-1234567"
6. Always end your reply with a helpful follow-up question
7. Use emojis occasionally to feel friendly and warm
8. Keep replies short — max 3-4 lines
`;

// conversation memory
const messages = [
  { role: "system", content: SYSTEM_PROMPT }
];

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log("🍕 Pizza Palace Support Bot");
console.log("============================");
console.log("Type 'quit' to exit\n");
console.log("Bella: Hi there! Welcome to Pizza Palace 🍕 How can I help you today?\n");

function chat() {
  rl.question("You: ", async (userInput) => {

    if (userInput.toLowerCase() === "quit") {
      console.log("Bella: Thanks for visiting Pizza Palace! Have a great day 😊");
      rl.close();
      return;
    }

    messages.push({ role: "user", content: userInput });

    const response = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: messages,
      temperature: 0.7,       // 0 = robotic, 1 = creative. 0.7 is perfect for support bots
      max_tokens: 200         // keep replies short and snappy
    });

    const reply = response.choices[0].message.content;
    messages.push({ role: "assistant", content: reply });

    console.log(`\nBella: ${reply}\n`);
    chat();
  });
}

chat();