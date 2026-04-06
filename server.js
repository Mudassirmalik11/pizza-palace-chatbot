// import express from "express";
// import Groq from "groq-sdk";
// import dotenv from "dotenv";

// dotenv.config();

// const app = express();
// const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// app.use(express.json());
// app.use(express.static("public")); // serves your HTML file

// const SYSTEM_PROMPT = `
// You are Bella, a friendly customer support assistant for Pizza Palace — 
// a pizza restaurant in Karachi, Pakistan.

// MENU:
// - Margherita Pizza (small: Rs.499, large: Rs.899)
// - BBQ Chicken Pizza (small: Rs.649, large: Rs.1099)
// - Veggie Supreme Pizza (small: Rs.549, large: Rs.949)
// - Garlic Bread: Rs.199
// - Soft Drinks: Rs.99

// HOURS: Open daily 12pm to 12am
// LOCATION: Block 5, Clifton, Karachi
// DELIVERY: Free delivery on orders above Rs.1000. Otherwise Rs.150 charge.
// ORDER PHONE: 0300-1234567

// YOUR RULES:
// 1. Be warm, friendly and helpful
// 2. Only answer Pizza Palace related questions
// 3. If asked anything unrelated say "I can only help with Pizza Palace questions! 😊"
// 4. Never make up information not listed above
// 5. If unsure, say "Please call us at 0300-1234567"
// 6. Always end with a helpful follow-up question
// 7. Use emojis occasionally
// 8. Keep replies short — max 3-4 lines
// `;

// // the /chat endpoint — browser sends messages here
// app.post("/chat", async (req, res) => {
//     console.log("Received message:", req.body);
//   const { messages } = req.body; // get conversation history from browser

//   const fullMessages = [
//     { role: "system", content: SYSTEM_PROMPT },
//     ...messages  // spread all previous messages
//   ];

//   const response = await groq.chat.completions.create({
//     model: "llama-3.3-70b-versatile",
//     messages: fullMessages,
//     temperature: 0.7,
//     max_tokens: 200
//   });

//   const reply = response.choices[0].message.content;
//   res.json({ reply }); // send reply back to browser
// });

// app.listen(3000, () => {
//   console.log("🍕 Pizza Palace bot running at http://localhost:3000");
// });



// Normal:   You wait 3 seconds... then BOOM full text appears
// Stream:   W-o-r-d-s  a-p-p-e-a-r  a-s  t-h-e-y  a-r-e  g-e-n-e-r-a-t-e-d

import express from "express";
import Groq from "groq-sdk";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

app.use(express.json());
app.use(express.static("public"));

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
1. Be warm, friendly and helpful
2. Only answer Pizza Palace related questions
3. If asked anything unrelated say "I can only help with Pizza Palace questions! 😊"
4. Never make up information not listed above
5. If unsure, say "Please call us at 0300-1234567"
6. Always end with a helpful follow-up question
7. Use emojis occasionally
8. Keep replies short — max 3-4 lines
`;

// ✅ NEW: streaming endpoint
app.post("/chat", async (req, res) => {
  const { messages } = req.body;

  const fullMessages = [
    { role: "system", content: SYSTEM_PROMPT },
    ...messages
  ];

  // tell the browser: "I'm sending a stream, not a normal response"
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  // create a STREAMING request to Groq
  const stream = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: fullMessages,
    temperature: 0.7,
    max_tokens: 200,
    stream: true   // ← this one line enables streaming
  });

  // as each chunk arrives from Groq, immediately send it to browser
  for await (const chunk of stream) {
    const text = chunk.choices[0]?.delta?.content || "";
    if (text) {
      // SSE format: data: <text>\n\n
      res.write(`data: ${JSON.stringify({ text })}\n\n`);
    }
  }

  // tell browser the stream is done
  res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
  res.end();
});

app.listen(3000, () => {
  console.log("🍕 Pizza Palace bot running at http://localhost:3000");
});