import { ChatGroq } from "@langchain/groq";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";

export const getLLMResponse = async (userMessage, conversationHistory) => {
    try {
        console.log('Initializing ChatGroq...');
        
        const model = new ChatGroq({
            apiKey: process.env.GROQ_API_KEY,
            model: "mixtral-8x7b-32768",
            temperature: 0.7,
        });

        // Format conversation history
        const formattedHistory = conversationHistory
            .map(msg => `${msg.sender === 'assistant' ? 'Assistant' : 'User'}: ${msg.content}`)
            .join('\n');

        // Create prompt template
        const prompt = ChatPromptTemplate.fromTemplate(`
            You are a mental health support assistant. Respond with empathy and understanding.
            
            Previous conversation:
            {history}
            
            User's message: {message}
            
            Provide a supportive and helpful response:
        `);

        // Create chain
        const chain = prompt
            .pipe(model)
            .pipe(new StringOutputParser());

        console.log('Sending request to Groq...');

        // Execute chain
        const response = await chain.invoke({
            history: formattedHistory,
            message: userMessage
        });

        console.log('Received response from Groq');
        return response;

    } catch (error) {
        console.error('Error in getLLMResponse:', error);
        throw new Error('Failed to get AI response');
    }
};
