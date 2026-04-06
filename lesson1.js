import Groq from "groq-sdk";
import dotenv from "dotenv";

dotenv.config(); // load your .env file

// connect to Groq
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

// send a message, get a reply
const response = await groq.chat.completions.create({
  model: "llama-3.3-70b-versatile",  // free, fast, very smart model
  messages: [
    { role: "user", content: "What is AI automation? Explain in simple words. can we say ai agent fall in ai automation category also chatbots in ai automation " }
  ]
});

// print the reply
console.log(response.choices[0].message.content);


