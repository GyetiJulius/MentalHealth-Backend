import express from 'express';
import cors from 'cors';
import * as dotenv from 'dotenv';
import { loadVectorStore } from './database/vectorStore.js';
import { getGroqLLM } from './utils/llm.js';
import { createMentalHealthChain } from './chains/mentalHealthChain.js';
import { connectDB } from './database/mongodb.js';
import chatRoutes from './routes/chat.js';
import { Conversation } from './models/conversation.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

let mentalHealthChain;
let chainMemory;

// Initialize services when server starts
async function initializeServer() {
    try {
        await connectDB();
        const vectorStore = await loadVectorStore();
        const llm = getGroqLLM();
        const { chain, memory } = createMentalHealthChain(llm, vectorStore);
        mentalHealthChain = chain;
        chainMemory = memory;
        console.log("Server initialized successfully");
    } catch (error) {
        console.error("Failed to initialize server:", error);
        process.exit(1);
    }
}

// Chat routes
app.use('/api', chatRoutes);

// Chat endpoint with conversation history
app.post('/api/chat/:conversationId', async (req, res) => {
    try {
        const { question } = req.body;
        const { conversationId } = req.params;

        if (!question) {
            return res.status(400).json({ error: 'Question is required' });
        }

        // Get the response from the chain
        const response = await mentalHealthChain.invoke({
            question: question
        });

        // Save the interaction to MongoDB
        await Conversation.findByIdAndUpdate(
            conversationId,
            {
                $push: {
                    messages: [
                        { role: 'user', content: question },
                        { role: 'assistant', content: response }
                    ]
                },
                $set: { updatedAt: Date.now() }
            }
        );

        // Save to memory for context in future responses
        await chainMemory.saveContext(
            { question: question },
            { response: response }
        );

        res.json({ response });
    } catch (error) {
        console.error('Error processing query:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

const PORT = process.env.PORT || 3000;

// Start the server
initializeServer().then(() => {
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
});
