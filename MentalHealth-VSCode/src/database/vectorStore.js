import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { FaissStore } from "@langchain/community/vectorstores/faiss";
import { fileURLToPath } from 'url';
import path from 'path';
import { getEmbeddings } from '../utils/embeddings.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function initializeVectorStore() {
    try {
        // Load PDF
        const filePath = path.join(__dirname, '../../data', 'The-Gale-Encyclopedia-of-Mental-Disorders-staibabussalamsula.ac_.id_.pdf');
        const loader = new PDFLoader(filePath);
        const docs = await loader.load();
        console.log(`Loaded ${docs.length} document(s)`);

        // Initialize embeddings
        const embeddings = getEmbeddings();

        // Create text splitter
        const textSplitter = new RecursiveCharacterTextSplitter({
            chunkSize: 1000,
            chunkOverlap: 200,
        });

        console.log("Splitting documents into chunks...");
        const chunks = await textSplitter.splitDocuments(docs);
        console.log(`Created ${chunks.length} chunks`);

        // Create and save the vector store
        console.log("Creating vector store...");
        const vectorStore = await FaissStore.fromDocuments(
            chunks,
            embeddings
        );

        // Save the vector store
        const saveDirectory = path.join(__dirname, "../../vector_store");
        await vectorStore.save(saveDirectory);
        console.log(`Vector store saved to ${saveDirectory}`);

        return vectorStore;
    } catch (error) {
        console.error("Error initializing vector store:", error);
        throw error;
    }
}

export async function loadVectorStore() {
    try {
        const embeddings = getEmbeddings();
        const loadDirectory = path.join(__dirname, "../../vector_store");
        return await FaissStore.load(loadDirectory, embeddings);
    } catch (error) {
        console.error("Error loading vector store:", error);
        throw error;
    }
}
