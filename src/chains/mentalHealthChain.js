import { PromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { formatDocumentsAsString } from "langchain/util/document";
import { BufferMemory } from "langchain/memory";
import { RunnableSequence } from "@langchain/core/runnables";

const SYSTEM_TEMPLATE = `You are a knowledgeable and empathetic mental health professional. 
Use the following pieces of context to answer the user's questions about mental health.
Always maintain a professional, supportive, and non-judgmental tone.
If you don't know something or if the context doesn't provide enough information, say so.
For emergencies or severe cases, always recommend seeking professional help.

Previous conversation history:
{chat_history}

Context from knowledge base:
{context}

Question: {question}

Remember:
1. Be accurate and base responses on the provided context
2. Show empathy and understanding
3. Maintain professional boundaries
4. Provide factual, educational information
5. Include appropriate disclaimers when necessary
6. Reference previous conversations when relevant`;

export const createMentalHealthChain = (llm, vectorStore) => {
    const memory = new BufferMemory({
        returnMessages: true,
        memoryKey: "chat_history",
        inputKey: "question",
    });

    const prompt = PromptTemplate.fromTemplate(SYSTEM_TEMPLATE);
    const retriever = vectorStore.asRetriever(3);

    const chain = RunnableSequence.from([
        {
            context: async (input) => {
                const relevantDocs = await retriever.getRelevantDocuments(input.question);
                return formatDocumentsAsString(relevantDocs);
            },
            question: (input) => input.question,
            chat_history: async (input) => {
                const memoryVariables = await memory.loadMemoryVariables({});
                return memoryVariables.chat_history || "";
            },
        },
        prompt,
        llm,
        new StringOutputParser(),
    ]);

    return {
        chain,
        memory
    };
};
