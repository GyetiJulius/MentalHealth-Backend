import { initializeVectorStore, loadVectorStore } from './database/vectorStore.js';

async function testVectorStore() {
    try {
        // Initialize vector store
        console.log("Initializing vector store...");
        await initializeVectorStore();

        // Test loading and querying
        console.log("\nTesting query capability...");
        const vectorStore = await loadVectorStore();
        
        const queryText = "What is depression?";
        const results = await vectorStore.similaritySearch(queryText, 2);

        console.log("\nQuery:", queryText);
        console.log("\nResults:");
        results.forEach((result, i) => {
            console.log(`\nResult ${i + 1}:`);
            console.log("Text:", result.pageContent.substring(0, 200) + "...");
            console.log("Source:", result.metadata.source || 'unknown');
        });

        console.log("\nTest completed successfully");
    } catch (error) {
        console.error("Test failed:", error);
        process.exit(1);
    }
}

testVectorStore();
