import { ChatGroq } from "@langchain/groq";
import * as dotenv from "dotenv";

dotenv.config();

export const getGroqLLM = () => {
    return new ChatGroq({
        apiKey: process.env.GROQ_API_KEY,
        model: "llama3-groq-70b-8192-tool-use-preview", 
        temperature: 0.7,
        maxTokens: 4096,
    });
};
